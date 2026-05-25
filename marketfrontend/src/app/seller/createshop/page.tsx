"use client";
import { API_URL } from "@/helper/api";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAllProvinces, getDistricts, getWards } from "@/services/addressAPI";
import { District, Province, Ward } from "@/validators/addressAPIModel";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { refreshAccessToken } from "@/lib/authSession";

type User = {
  id: number;
  fullName: string;
  email: string;
};

type ShopFormData = {
  shopName: string;
  pickupAddress: string;
  phone: string;
  provinceId: number | null;
  districtId: number | null;
  wardCode: number | null;
};

type IdentificationFormData = {
  fullName: string;
  idNumber: string;
  idFront: File | null;
  idBack: File | null;
  idFrontUrl: string;
  idBackUrl: string;
};

type TaxFormData = {
  taxCode: string;
};

type ShopFormErrors = Partial<Record<keyof ShopFormData, string>>;
type IdentificationErrors = Partial<
  Record<keyof IdentificationFormData, string>
>;
type TaxFormErrors = Partial<Record<keyof TaxFormData, string>>;

const SELLER_DRAFT_USER_KEY = "seller_registration_user_id";
const SELLER_DRAFT_STEP_KEY = "seller_registration_current_step";
const SELLER_STEP_ONE_KEY = "seller_step_1";
const SELLER_STEP_TWO_KEY = "seller_step_2";
const SELLER_STEP_THREE_KEY = "seller_step_3";
const SELLER_SHOP_ID_KEY = "seller_shop_id";
const SELLER_SHOP_USER_ID_KEY = "seller_shop_user_id";

const clampRegistrationStep = (value: unknown) => {
  const step = Number(value);

  if (!Number.isInteger(step)) return null;
  if (step < 1) return 1;
  if (step > 4) return 4;

  return step;
};

const clearSellerRegistrationDraft = () => {
  [
    SELLER_DRAFT_USER_KEY,
    SELLER_DRAFT_STEP_KEY,
    SELLER_STEP_ONE_KEY,
    SELLER_STEP_TWO_KEY,
    SELLER_STEP_THREE_KEY,
  ].forEach((key) => localStorage.removeItem(key));
};

const promoteStoredUserToSeller = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...storedUser,
        userType: "both",
        role: "seller",
      }),
    );
  } catch {
    return;
  }
};

const getShopId = (shop: any) => Number(shop?.id ?? shop?.shop_id ?? 0);

const readOptionalJson = async (response: Response) => {
  const text = await response.text();

  if (!text.trim()) return null;

  return JSON.parse(text);
};

const getShopOnboardingStep = (shop: any) => {
  if (shop?.onboarding_step === null || shop?.onboarding_step === undefined) {
    return null;
  }

  const onboardingStep = Number(shop?.onboarding_step);

  if (!Number.isInteger(onboardingStep)) return null;

  return clampRegistrationStep(onboardingStep);
};

const verifyShopOnboardingStep = async (
  shopId: number,
  onboardingStep: number,
) => {
  const res = await fetch(`${API_URL}/shops/${shopId}`, {
    cache: "no-store",
  });

  if (!res.ok) return false;

  const shop = await readOptionalJson(res);
  return Number(shop?.onboarding_step) === onboardingStep;
};

const persistShopOnboardingStep = async (
  shopId: number,
  onboardingStep: number,
) => {
  const safeOnboardingStep = clampRegistrationStep(onboardingStep);

  if (!shopId || safeOnboardingStep === null) return false;

  const payload = {
    onboarding_step: safeOnboardingStep,
  };

  const res = await fetch(`${API_URL}/shops/${shopId}/onboarding-step`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 404 || res.status === 405) {
    const fallbackRes = await fetch(`${API_URL}/shops/${shopId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!fallbackRes.ok) {
      console.log("UPDATE ONBOARDING STEP ERROR:", await fallbackRes.text());
      return false;
    }

    return verifyShopOnboardingStep(shopId, safeOnboardingStep);
  }

  if (!res.ok) {
    console.log("UPDATE ONBOARDING STEP ERROR:", await res.text());
    return false;
  }

  return verifyShopOnboardingStep(shopId, safeOnboardingStep);
};

const getSavedRegistrationStep = () => {
  let savedStep = clampRegistrationStep(
    localStorage.getItem(SELLER_DRAFT_STEP_KEY),
  ) ?? 1;

  const savedIdentification = localStorage.getItem(SELLER_STEP_TWO_KEY);
  if (savedIdentification) {
    const data = JSON.parse(savedIdentification);
    const hasSavedIdentification =
      !!data.fullName &&
      !!data.idNumber &&
      (!!data.idFrontUrl || !!data.idFrontName) &&
      (!!data.idBackUrl || !!data.idBackName);

    if (hasSavedIdentification) {
      savedStep = Math.max(savedStep, 3);
    }
  }

  const savedTax = localStorage.getItem(SELLER_STEP_THREE_KEY);
  if (savedTax) {
    const data = JSON.parse(savedTax);
    if (data.taxCode) {
      savedStep = Math.max(savedStep, 3);
    }
  }

  return savedStep;
};

export default function ShopInfoPage() {
  const router = useRouter();
  const { shop: authShop } = useSellerAuth();
  const MAX_SHOP_NAME = 30;

  const [step, setStep] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [shopId, setShopId] = useState<number | null>(null);

  const [form, setForm] = useState<ShopFormData>({
    shopName: "",
    pickupAddress: "",
    phone: "",
    provinceId: null,
    districtId: null,
    wardCode: null,
  });

  const [identification, setIdentification] = useState<IdentificationFormData>({
    fullName: "",
    idNumber: "",
    idFront: null,
    idBack: null,
    idFrontUrl: "",
    idBackUrl: "",
  });

  const [errors, setErrors] = useState<ShopFormErrors>({});
  const [idErrors, setIdErrors] = useState<IdentificationErrors>({});
  const [taxInfo, setTaxInfo] = useState<TaxFormData>({
    taxCode: "",
  });
  const [taxErrors, setTaxErrors] = useState<TaxFormErrors>({});

  const getFieldRegistrationStep = (shop: any) => {
    if (!shop) return 1;

    const hasShopInfo = getShopId(shop) > 0;
    const hasIdentification =
      !!shop.owner_name &&
      !!shop.business_license &&
      !!shop.url_card_front &&
      !!shop.url_card_back;

    const hasTax = !!shop.tax_code;

    if (!hasShopInfo) return 1;
    if (!hasIdentification) return 2;
    if (!hasTax) return 3;

    return 4;
  };

  const getRegistrationStep = (shop: any) => {
    const fieldStep = getFieldRegistrationStep(shop);

    if (fieldStep >= 4) return 4;

    const onboardingStep = getShopOnboardingStep(shop);
    if (onboardingStep !== null && onboardingStep > 1) {
      return Math.min(onboardingStep, 3);
    }

    return fieldStep;
  };

  const isShopComplete = (shop: any) => getFieldRegistrationStep(shop) >= 4;

  const getResumeStep = (shop: any, draftStep = getSavedRegistrationStep()) => {
    const backendStep = getRegistrationStep(shop);
    const onboardingStep = getShopOnboardingStep(shop);

    if (backendStep >= 4) return 4;
    if (onboardingStep !== null && onboardingStep > 1) {
      return Math.min(onboardingStep, 3);
    }

    return Math.min(Math.max(draftStep, backendStep, 2), 3);
  };

  useEffect(() => {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(rawUser) as User;
    const draftUserId = Number(localStorage.getItem(SELLER_DRAFT_USER_KEY) || 0);

    if (draftUserId > 0 && draftUserId !== parsedUser.id) {
      clearSellerRegistrationDraft();
    }

    localStorage.setItem(SELLER_DRAFT_USER_KEY, String(parsedUser.id));

    setUser(parsedUser);

    setIdentification((prev) => ({
      ...prev,
      fullName: parsedUser.fullName || "",
    }));

    const savedStep = clampRegistrationStep(
      localStorage.getItem(SELLER_DRAFT_STEP_KEY),
    );

    let savedDraftStep = getSavedRegistrationStep();

    const saved = localStorage.getItem(SELLER_STEP_ONE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setForm({
        shopName: data.shopName || "",
        pickupAddress: data.pickupAddress || "",
        phone: data.phone || "",
        provinceId: data.provinceId ?? null,
        districtId: data.districtId ?? null,
        wardCode: data.wardCode ?? null,
      });
    }

    const savedStep2 = localStorage.getItem(SELLER_STEP_TWO_KEY);
    if (savedStep2) {
      const data = JSON.parse(savedStep2);
      setIdentification((prev) => ({
        ...prev,
        fullName: data.fullName || prev.fullName,
        idNumber: data.idNumber || "",
        idFrontUrl: data.idFrontUrl || "",
        idBackUrl: data.idBackUrl || "",
      }));
    }

    const savedStep3 = localStorage.getItem(SELLER_STEP_THREE_KEY);
    if (savedStep3) {
      const data = JSON.parse(savedStep3);
      setTaxInfo({
        taxCode: data.taxCode || "",
      });
    }

    const savedShopId = Number(localStorage.getItem(SELLER_SHOP_ID_KEY) || 0);
    const savedShopUserId = Number(
      localStorage.getItem(SELLER_SHOP_USER_ID_KEY) || 0,
    );
    const hasSavedShopForUser =
      savedShopId > 0 && savedShopUserId === parsedUser.id;

    if (hasSavedShopForUser) {
      setShopId(savedShopId);
    } else {
      localStorage.removeItem(SELLER_SHOP_ID_KEY);
      localStorage.removeItem(SELLER_SHOP_USER_ID_KEY);
    }

    if (savedStep !== null || savedDraftStep > 1) {
      setStep(
        hasSavedShopForUser ? Math.max(savedDraftStep, 2) : savedDraftStep,
      );
    }

    const loadExistingShop = async () => {
      if (!parsedUser?.id) return;

      try {
        const shopRes = await fetch(
          `${API_URL}/seller/shop/user/${parsedUser.id}`,
        );

        if (!shopRes.ok) return;

        const shopData = await readOptionalJson(shopRes);
        if (!shopData) return;

        const existingShopId = getShopId(shopData);
        if (existingShopId > 0) {
          setShopId(existingShopId);
          localStorage.setItem(SELLER_SHOP_ID_KEY, String(existingShopId));
          localStorage.setItem(SELLER_SHOP_USER_ID_KEY, String(parsedUser.id));

          if (isShopComplete(shopData)) {
            clearSellerRegistrationDraft();
            router.push("/seller");
            return;
          }

          setStep(getResumeStep(shopData, savedDraftStep));

          setIdentification((prev) => ({
            ...prev,
            fullName: shopData.owner_name || prev.fullName,
            idNumber: shopData.business_license || prev.idNumber,
            idFrontUrl: shopData.url_card_front || prev.idFrontUrl,
            idBackUrl: shopData.url_card_back || prev.idBackUrl,
          }));

          setTaxInfo((prev) => ({
            taxCode: shopData.tax_code || prev.taxCode,
          }));
        } else if (savedStep && savedStep > 1) {
          setStep(1);
          localStorage.removeItem(SELLER_SHOP_ID_KEY);
          localStorage.removeItem(SELLER_SHOP_USER_ID_KEY);
        }
      } catch (err) {
        console.log("Unable to load existing shop for current user", err);
      }
    };

    loadExistingShop();
  }, [router]);

  const { data: provinces = [] } = useQuery<Province[], Error>({
    queryKey: ["provinces"],
    queryFn: () => getAllProvinces(),
  });

  const { data: districts = [] } = useQuery<District[], Error>({
    queryKey: ["districts", form.provinceId],
    queryFn: () => getDistricts(form.provinceId || 0),
    enabled: !!form.provinceId,
  });

  const { data: wards = [] } = useQuery<Ward[], Error>({
    queryKey: ["wards", form.districtId],
    queryFn: () => getWards(form.districtId || 0),
    enabled: !!form.districtId,
  });

  useEffect(() => {
    if (!shopId) return;

    setStep((currentStep) => Math.max(currentStep, 2));
  }, [shopId]);

  useEffect(() => {
    if (!user) return;

    const authShopId = Number(authShop?.id ?? (authShop as any)?.shop_id ?? 0);

    if (authShopId <= 0) return;

    setShopId(authShopId);
    localStorage.setItem(SELLER_SHOP_ID_KEY, String(authShopId));
    localStorage.setItem(SELLER_SHOP_USER_ID_KEY, String(user.id));

    if (isShopComplete(authShop)) {
      clearSellerRegistrationDraft();
      router.push("/seller");
      return;
    }

    setStep(getResumeStep(authShop));
  }, [authShop, user]);

  useEffect(() => {
    if (!user) return;

    const nextStep = shopId ? Math.max(step, 2) : step;

    if (shopId && nextStep > 1) {
      void persistShopOnboardingStep(shopId, nextStep);
    }

    if (nextStep >= 4) {
      clearSellerRegistrationDraft();
      return;
    }

    localStorage.setItem(SELLER_DRAFT_USER_KEY, String(user.id));
    localStorage.setItem(SELLER_DRAFT_STEP_KEY, String(nextStep));
  }, [shopId, step, user]);

  useEffect(() => {
    if (!user) return;

    localStorage.setItem(
      SELLER_STEP_ONE_KEY,
      JSON.stringify({
        shopName: form.shopName.trim(),
        pickupAddress: form.pickupAddress.trim(),
        phone: form.phone.trim(),
        provinceId: form.provinceId,
        districtId: form.districtId,
        wardCode: form.wardCode,
      }),
    );
  }, [form, user]);

  useEffect(() => {
    if (!user) return;

    localStorage.setItem(
      SELLER_STEP_TWO_KEY,
      JSON.stringify({
        fullName: identification.fullName.trim(),
        idNumber: identification.idNumber.trim(),
        idFrontName: identification.idFront?.name || "",
        idBackName: identification.idBack?.name || "",
        idFrontUrl: identification.idFrontUrl,
        idBackUrl: identification.idBackUrl,
      }),
    );
  }, [identification, user]);

  useEffect(() => {
    if (!user) return;

    localStorage.setItem(
      SELLER_STEP_THREE_KEY,
      JSON.stringify({
        taxCode: taxInfo.taxCode.trim(),
      }),
    );
  }, [taxInfo, user]);

  if (!user) return null;

  const currentStep = shopId ? Math.max(step, 2) : step;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    const parsedValue = ["provinceId", "districtId", "wardCode"].includes(name)
      ? value === ""
        ? null
        : Number(value)
      : value;

    setForm((prev) => {
      const nextState = {
        ...prev,
        [name]: parsedValue,
      } as ShopFormData;

      if (name === "provinceId") {
        nextState.districtId = null;
        nextState.wardCode = null;
      }

      if (name === "districtId") {
        nextState.wardCode = null;
      }

      return nextState;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleIdentificationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, files } = e.target;

    setIdentification((prev) => {
      const next = {
        ...prev,
        [name]: files ? files[0] ?? null : value,
      };

      if (name === "idFront" && files?.[0]) {
        next.idFrontUrl = "";
      }

      if (name === "idBack" && files?.[0]) {
        next.idBackUrl = "";
      }

      return next;
    });

    setIdErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors: ShopFormErrors = {};

    if (!form.shopName.trim()) {
      newErrors.shopName = "Tên shop là bắt buộc";
    } else if (form.shopName.trim().length < 3) {
      newErrors.shopName = "Tên shop tối thiểu 3 ký tự";
    }

    if (!form.provinceId) {
      newErrors.provinceId = "Vui lòng chọn tỉnh/thành phố";
    }

    if (!form.districtId) {
      newErrors.districtId = "Vui lòng chọn quận/huyện";
    }

    if (!form.wardCode) {
      newErrors.wardCode = "Vui lòng chọn phường/xã";
    }

    if (!form.pickupAddress.trim()) {
      newErrors.pickupAddress = "Số nhà và tên đường là bắt buộc";
    } else if (form.pickupAddress.trim().length < 5) {
      newErrors.pickupAddress = "Số nhà và tên đường tối thiểu 5 ký tự";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^(\+84|0)[0-9]{9}$/.test(form.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateIdentification = () => {
    const newErrors: IdentificationErrors = {};

    if (!identification.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!identification.idNumber.trim()) {
      newErrors.idNumber = "Số CCCD/CMND là bắt buộc";
    } else if (!/^[0-9]{9,12}$/.test(identification.idNumber.trim())) {
      newErrors.idNumber = "Số CCCD/CMND không hợp lệ";
    }

    if (!identification.idFront && !identification.idFrontUrl) {
      newErrors.idFront = "Vui lòng tải ảnh mặt trước CCCD";
    }

    if (!identification.idBack && !identification.idBackUrl) {
      newErrors.idBack = "Vui lòng tải ảnh mặt sau CCCD";
    }

    setIdErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveStepOne = () => {
    localStorage.setItem(
      SELLER_STEP_ONE_KEY,
      JSON.stringify({
        shopName: form.shopName.trim(),
        pickupAddress: form.pickupAddress.trim(),
        phone: form.phone.trim(),
        provinceId: form.provinceId,
        districtId: form.districtId,
        wardCode: form.wardCode,
      }),
    );
  };

  const saveStepTwo = () => {
    localStorage.setItem(
      SELLER_STEP_TWO_KEY,
      JSON.stringify({
        fullName: identification.fullName.trim(),
        idNumber: identification.idNumber.trim(),
        idFrontName: identification.idFront?.name || "",
        idBackName: identification.idBack?.name || "",
        idFrontUrl: identification.idFrontUrl,
        idBackUrl: identification.idBackUrl,
      }),
    );
  };

  const saveStepThree = () => {
    localStorage.setItem(
      SELLER_STEP_THREE_KEY,
      JSON.stringify({
        taxCode: taxInfo.taxCode.trim(),
      }),
    );
  };

  const handleSaveDraft = () => {
    saveStepOne();
    saveStepTwo();
    saveStepThree();
    alert("Đã lưu nháp");
  };

  const rememberShopId = (nextShopId: number) => {
    setShopId(nextShopId);
    localStorage.setItem(SELLER_SHOP_ID_KEY, String(nextShopId));
    localStorage.setItem(SELLER_SHOP_USER_ID_KEY, String(user.id));
  };

  const getExistingShopForUser = async () => {
    const authShopId = Number(authShop?.id ?? (authShop as any)?.shop_id ?? 0);

    if (authShopId > 0) {
      return { ...authShop, id: authShopId };
    }

    const checkRes = await fetch(`${API_URL}/shops/check?user_id=${user.id}`, {
      cache: "no-store",
    });

    if (checkRes.ok) {
      const checkData = await readOptionalJson(checkRes);
      const checkedShop = checkData?.shop;
      const checkedShopId = getShopId(checkedShop);

      if (checkedShopId > 0) {
        return { ...checkedShop, id: checkedShopId };
      }
    }

    const shopRes = await fetch(`${API_URL}/seller/shop/user/${user.id}`, {
      cache: "no-store",
    });

    if (shopRes.ok) {
      const shopData = await readOptionalJson(shopRes);
      if (!shopData) return null;

      const existingShopId = getShopId(shopData);

      if (existingShopId > 0) {
        return { ...shopData, id: existingShopId };
      }
    }

    return null;
  };

  const ensureShopAddress = async (nextShopId: number, now: string) => {
    const existingAddressRes = await fetch(
      `${API_URL}/addresses/shop/${nextShopId}`,
    );

    if (existingAddressRes.ok) return true;

    if (existingAddressRes.status !== 404) {
      const errorText = await existingAddressRes.text();
      console.log("CHECK SHOP ADDRESS ERROR:", errorText);
      alert("Kiểm tra địa chỉ shop thất bại: " + errorText);
      return false;
    }

    const addressPayload = {
      shop_id: Number(nextShopId),
      recipientName: user.fullName || form.shopName.trim(),
      recipientPhone: form.phone.trim(),
      addressLine: form.pickupAddress.trim(),
      ward: form.wardCode,
      district: form.districtId,
      city: form.provinceId,
      postalCode: "",
      isDefault: 1,
      createdAt: now,
      updatedAt: now,
    };

    console.log("ADDRESS PAYLOAD:", addressPayload);

    const addressRes = await fetch(`${API_URL}/addresses/shop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addressPayload),
    });

    if (!addressRes.ok) {
      const errorText = await addressRes.text();
      console.log("CREATE ADDRESS ERROR:", errorText);
      alert("Lưu địa chỉ thất bại: " + errorText);
      return false;
    }

    return true;
  };

  const updateShopOnboardingStep = async (
    onboardingStep: number,
    targetShopId?: number,
  ) => {
    const currentShopId =
      targetShopId ||
      shopId ||
      Number(localStorage.getItem(SELLER_SHOP_ID_KEY) || 0);

    if (!currentShopId) return false;

    try {
      return await persistShopOnboardingStep(currentShopId, onboardingStep);
    } catch (err) {
      console.log("Unable to update onboarding step", err);
      return false;
    }
  };

  const goToIdentificationStep = async (nextShopId: number) => {
    const savedOnboardingStep = await updateShopOnboardingStep(2, nextShopId);

    if (!savedOnboardingStep) {
      alert("Không lưu được bước tạo shop. Vui lòng thử lại.");
      return;
    }

    saveStepOne();
    setStep(2);
  };

  const updateShopInfo = async (
    currentShopId: number,
    payload: Record<string, string | number>,
  ) => {
    const res = await fetch(`${API_URL}/shops/${currentShopId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 405 && payload.onboarding_step) {
      await persistShopOnboardingStep(
        currentShopId,
        Number(payload.onboarding_step),
      );
    }

    return res;
  };

  const goToStep = (nextStep: number) => {
    const safeStep = clampRegistrationStep(nextStep) ?? 0;
    setStep(safeStep);

    if (safeStep > 1) {
      void updateShopOnboardingStep(safeStep);
    }
  };

  const handleSubmitShopInfo = async () => {
    try {
      const now = new Date().toISOString().slice(0, 19);
      const existingShop = await getExistingShopForUser();

      if (existingShop) {
        const existingShopId = getShopId(existingShop);

        if (isShopComplete(existingShop)) {
          clearSellerRegistrationDraft();
          router.push("/seller");
          return;
        }

        rememberShopId(existingShopId);
        const resumeStep = getResumeStep(existingShop);

        if (currentStep === 1 || resumeStep <= 2) {
          if (!validate()) return;

          await goToIdentificationStep(existingShopId);
          return;
        }

        await updateShopOnboardingStep(resumeStep, existingShopId);
        setStep(resumeStep);
        return;
      }

      if (!validate()) return;

      const savedStep2 = localStorage.getItem(SELLER_STEP_TWO_KEY);
      const savedStep3 = localStorage.getItem(SELLER_STEP_THREE_KEY);
      const businessLicense = savedStep2 ? JSON.parse(savedStep2).idNumber : "";
      const taxCode = savedStep3 ? JSON.parse(savedStep3).taxCode : "";

      const shopPayload = {
        user_id: Number(user.id),
        shop_name: form.shopName.trim(),
        shop_description: "",
        shop_logo: "",
        shop_banner: "",
        business_license: businessLicense,
        tax_code: taxCode,
        rating: 0,
        total_products: 0,
        total_orders: 0,
        response_rate: 0,
        response_time: 0,
        is_verified: 0,
        is_active: 1,
        onboarding_step: 2,
        created_at: now,
        updated_at: now,
      };

      console.log("CREATING SHOP PAYLOAD:", shopPayload);

      const shopRes = await fetch(`${API_URL}/shops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopPayload),
      });

      let nextShopId = 0;

      if (!shopRes.ok) {
        const errorText = await shopRes.text();

        if (shopRes.status === 409) {
          console.log("SHOP EXISTS, REUSING EXISTING SHOP:", errorText);
          const existingShop = await getExistingShopForUser();

          if (!existingShop) {
            alert("Shop đã tồn tại nhưng không lấy được shop ID");
            return;
          }

          if (isShopComplete(existingShop)) {
            clearSellerRegistrationDraft();
            router.push("/seller");
            return;
          }

          nextShopId = getShopId(existingShop);
          rememberShopId(nextShopId);
          const resumeStep = getResumeStep(existingShop);

          if (currentStep === 1 || resumeStep <= 2) {
            await goToIdentificationStep(nextShopId);
            return;
          }

          await updateShopOnboardingStep(resumeStep, nextShopId);
          setStep(resumeStep);
          return;
        }

        console.log("CREATE SHOP ERROR:", errorText);
        alert("Tạo shop thất bại: " + errorText);
        return;
      }

      const shop = await readOptionalJson(shopRes);
      if (isShopComplete(shop)) {
        clearSellerRegistrationDraft();
        router.push("/seller");
        return;
      }

      nextShopId = getShopId(shop);

      if (!nextShopId) {
        alert("Tạo shop thành công nhưng không lấy được shop id");
        return;
      }

      rememberShopId(nextShopId);

      const resumeStep = getResumeStep(shop);
      const nextStep = Math.max(resumeStep, 2);

      const hasAddress = await ensureShopAddress(nextShopId, now);
      if (!hasAddress) return;

      if (nextStep === 2) {
        await goToIdentificationStep(nextShopId);
        return;
      }

      await updateShopOnboardingStep(nextStep, nextShopId);
      setStep(nextStep);
    } catch (err) {
      console.log(err);
      alert("Có lỗi xảy ra");
    }
  };

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_URL}/api/upload/category`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) throw new Error("Upload ảnh thất bại");

    const data = await res.json();
    return data.url;
  };

  const handleSubmitIdentification = async () => {
    if (!validateIdentification()) return;

    const currentShopId =
      shopId || Number(localStorage.getItem(SELLER_SHOP_ID_KEY) || 0);

    if (!currentShopId) {
      alert("Không tìm thấy shop ID để cập nhật thông tin định danh");
      return;
    }

    try {
      let idCardFrontUrl = identification.idFrontUrl;
      let idCardBackUrl = identification.idBackUrl;

      if (identification.idFront) {
        idCardFrontUrl = await uploadImage(identification.idFront);
      }

      if (identification.idBack) {
        idCardBackUrl = await uploadImage(identification.idBack);
      }

      const updateRes = await updateShopInfo(currentShopId, {
        owner_name: identification.fullName.trim(),
        business_license: identification.idNumber.trim(),
        url_card_front: idCardFrontUrl,
        url_card_back: idCardBackUrl,
        onboarding_step: 3,
      });

      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.log("UPDATE IDENTIFICATION ERROR:", errorText);
        alert("Lưu thông tin định danh thất bại: " + errorText);
        return;
      }

      await updateShopOnboardingStep(3, currentShopId);

      setIdentification((prev) => ({
        ...prev,
        idFront: null,
        idBack: null,
        idFrontUrl: idCardFrontUrl,
        idBackUrl: idCardBackUrl,
      }));

      localStorage.setItem(
        SELLER_STEP_TWO_KEY,
        JSON.stringify({
          fullName: identification.fullName.trim(),
          idNumber: identification.idNumber.trim(),
          idFrontName: "",
          idBackName: "",
          idFrontUrl: idCardFrontUrl,
          idBackUrl: idCardBackUrl,
        }),
      );
      setStep(3);
    } catch (err) {
      console.log(err);
      alert("Có lỗi khi upload ảnh hoặc lưu thông tin định danh");
    }
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setTaxInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTaxErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateTaxInfo = () => {
    const newErrors: TaxFormErrors = {};

    if (!taxInfo.taxCode.trim()) {
      newErrors.taxCode = "Mã số thuế là bắt buộc";
    }

    setTaxErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTaxInfo = async () => {
    if (!validateTaxInfo()) return;

    saveStepTwo();
    saveStepThree();

    const currentShopId =
      shopId || Number(localStorage.getItem(SELLER_SHOP_ID_KEY) || 0);

    if (!currentShopId) {
      alert("Không tìm thấy shop ID để cập nhật thông tin");
      return;
    }

    try {
      let idCardFrontUrl = identification.idFrontUrl;
      let idCardBackUrl = identification.idBackUrl;

      if (identification.idFront) {
        idCardFrontUrl = await uploadImage(identification.idFront);
      }

      if (identification.idBack) {
        idCardBackUrl = await uploadImage(identification.idBack);
      }

      const updatePayload: Record<string, string | number> = {
        owner_name: identification.fullName.trim(),
        business_license: identification.idNumber.trim(),
        tax_code: taxInfo.taxCode.trim(),
        onboarding_step: 4,
      };

      if (idCardFrontUrl) {
        updatePayload.url_card_front = idCardFrontUrl;
      }

      if (idCardBackUrl) {
        updatePayload.url_card_back = idCardBackUrl;
      }

      const updateRes = await updateShopInfo(currentShopId, updatePayload);

      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.log("UPDATE SHOP ERROR:", errorText);
        alert("Lưu thông tin xác minh thất bại: " + errorText);
        return;
      }

      await updateShopOnboardingStep(4, currentShopId);

      const verifyRes = await fetch(`${API_URL}/shops/${currentShopId}/verify`, {
        method: "PATCH",
      });

      if (!verifyRes.ok) {
        const errorText = await verifyRes.text();
        console.log("VERIFY SHOP ERROR:", errorText);
        alert("Cập nhật quyền seller thất bại: " + errorText);
        return;
      }

      promoteStoredUserToSeller();

      const refreshedToken = await refreshAccessToken();
      if (!refreshedToken) {
        alert("Shop đã tạo xong. Vui lòng đăng nhập lại để vào kênh người bán.");
        return;
      }

      clearSellerRegistrationDraft();
      setStep(4);
    } catch (err) {
      console.log(err);
      alert("Có lỗi khi upload ảnh hoặc lưu thông tin xác minh");
    }
  };

  return (
    <div className="page">
      <div className="steps">
        {[
          "Shop information",
          "Identification information",
          "Tax information",
          "Complete",
        ].map((stepName, index) => (
          <div
            key={stepName}
            className={`step ${index + 1 === currentStep ? "active" : ""}`}
          >
            {stepName}
          </div>
        ))}
      </div>

      <hr />

      {currentStep === 1 && (
        <>
          <div className="form">
            <div className="row">
              <label>
                Shop name <span>*</span>
              </label>

              <div className="field">
                <input
                  name="shopName"
                  maxLength={MAX_SHOP_NAME}
                  value={form.shopName}
                  onChange={handleChange}
                  placeholder="Enter the shop name"
                />

                <div className="meta">
                  <span className="error">{errors.shopName}</span>
                  <span className="counter">
                    {form.shopName.length}/{MAX_SHOP_NAME}
                  </span>
                </div>
              </div>
            </div>

            <div className="row">
              <label>
                Pickup address <span>*</span>
              </label>

              <div className="field address-grid">
                <div className="address-row">
                  <select
                    name="provinceId"
                    value={form.provinceId ?? ""}
                    onChange={handleChange}
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((province) => (
                      <option
                        key={province.ProvinceID}
                        value={province.ProvinceID}
                      >
                        {province.ProvinceName}
                      </option>
                    ))}
                  </select>
                  <span className="error">{errors.provinceId}</span>
                </div>

                <div className="address-row">
                  <select
                    name="districtId"
                    value={form.districtId ?? ""}
                    onChange={handleChange}
                    disabled={!form.provinceId}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option
                        key={district.DistrictID}
                        value={district.DistrictID}
                      >
                        {district.DistrictName}
                      </option>
                    ))}
                  </select>
                  <span className="error">{errors.districtId}</span>
                </div>

                <div className="address-row">
                  <select
                    name="wardCode"
                    value={form.wardCode ?? ""}
                    onChange={handleChange}
                    disabled={!form.districtId}
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </option>
                    ))}
                  </select>
                  <span className="error">{errors.wardCode}</span>
                </div>

                <div className="address-row">
                  <input
                    name="pickupAddress"
                    value={form.pickupAddress}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường"
                  />
                  <span className="error">{errors.pickupAddress}</span>
                </div>
              </div>
            </div>

            <div className="row">
              <label>Email</label>

              <div className="field">
                <input value={user.email} disabled />
                <small className="note">
                  The email address is obtained from the login account.
                </small>
              </div>
            </div>

            <div className="row">
              <label>
                Phone number <span>*</span>
              </label>

              <div className="field">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+84 / 0xxx"
                />
                <span className="error">{errors.phone}</span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="btn-outline" onClick={handleSaveDraft}>
              Save Draft
            </button>
            <button className="btn-primary" onClick={handleSubmitShopInfo}>
              Next
            </button>
          </div>
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="form">
            <div className="row">
              <label>
                Full name <span>*</span>
              </label>

              <div className="field">
                <input
                  name="fullName"
                  value={identification.fullName}
                  onChange={handleIdentificationChange}
                  placeholder="Enter full name"
                />
                <span className="error">{idErrors.fullName}</span>
              </div>
            </div>

            <div className="row">
              <label>
                ID number <span>*</span>
              </label>

              <div className="field">
                <input
                  name="idNumber"
                  value={identification.idNumber}
                  onChange={handleIdentificationChange}
                  placeholder="Enter CCCD/CMND number"
                />
                <span className="error">{idErrors.idNumber}</span>
              </div>
            </div>

            <div className="row">
              <label>
                CCCD front <span>*</span>
              </label>

              <div className="field">
                <input
                  name="idFront"
                  type="file"
                  accept="image/*"
                  onChange={handleIdentificationChange}
                />
                {identification.idFrontUrl && (
                  <small className="note">Đã lưu ảnh mặt trước CCCD.</small>
                )}
                <span className="error">{idErrors.idFront}</span>
              </div>
            </div>

            <div className="row">
              <label>
                CCCD back <span>*</span>
              </label>

              <div className="field">
                <input
                  name="idBack"
                  type="file"
                  accept="image/*"
                  onChange={handleIdentificationChange}
                />
                {identification.idBackUrl && (
                  <small className="note">Đã lưu ảnh mặt sau CCCD.</small>
                )}
                <span className="error">{idErrors.idBack}</span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn-outline"
              onClick={() => goToStep(shopId ? 2 : 1)}
            >
              Back
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmitIdentification}
            >
              Next
            </button>
          </div>
        </>
      )}

      {currentStep === 3 && (
        <>
          <div className="form">
            <div className="row">
              <label>
                Tax information <span>*</span>
              </label>

              <div className="field">
                <input
                  name="taxCode"
                  value={taxInfo.taxCode}
                  onChange={handleTaxChange}
                  placeholder="Tax code"
                />
                <span className="error">{taxErrors.taxCode}</span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="btn-outline" onClick={() => goToStep(2)}>
              Back
            </button>
            <button className="btn-primary" onClick={handleSubmitTaxInfo}>
              Next
            </button>
          </div>
        </>
      )}

      {currentStep === 4 && (
        <>
          <div className="form">
            <h3>Complete</h3>
            <p>Shop registration information has been completed.</p>
          </div>

          <div className="actions">
            <button className="btn-outline" onClick={() => goToStep(3)}>
              Back
            </button>
            <button
              className="btn-primary"
              onClick={() => router.push("/seller")}
            >
              Go to Seller Center
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .page {
          max-width: 900px;
          margin: 40px auto;
          background: #fff;
          padding: 32px;
          border-radius: 6px;
        }

        .steps {
          display: flex;
          gap: 24px;
          font-size: 14px;
        }

        .step {
          color: #bbb;
        }

        .step.active {
          color: #ee4d2d;
          font-weight: 600;
        }

        .row {
          display: flex;
          margin-bottom: 24px;
        }

        .address-grid {
          display: grid;
          gap: 12px;
        }

        .address-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          width: 200px;
        }

        label span {
          color: red;
        }

        .field {
          flex: 1;
        }

        input,
        select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          color: #0f172a;
        }

        input:disabled {
          background: #f5f5f5;
          color: #666;
        }

        .meta {
          display: flex;
          justify-content: space-between;
        }

        .counter,
        .error,
        .note {
          font-size: 12px;
        }

        .counter,
        .note {
          color: #999;
        }

        .error {
          color: red;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
        }

        .btn-outline {
          padding: 8px 20px;
          border: 1px solid #ddd;
          background: #fff;
        }

        .btn-primary {
          padding: 8px 20px;
          background: #ee4d2d;
          color: #fff;
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
