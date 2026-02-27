"use client";
import React, { useState, useMemo } from "react";
import { Modal, Input, Button, message } from "antd";
import { Attribute } from "@/validators/attribute";

interface AttributeValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: Attribute | null;
  initialValues?: string[];
  onSave: (values: string[]) => void;
}

const AttributeValueModal: React.FC<AttributeValueModalProps> = ({
  isOpen,
  onClose,
  attribute,
  initialValues = [],
  onSave,
}) => {
  // ✅ FIX: Initialize state with a function that computes from props
  // This ensures state is initialized correctly without useEffect
  const [values, setValues] = useState<string[]>(() => {
    return initialValues.length > 0 ? [...initialValues] : [""];
  });

  // ✅ FIX: Use useMemo for derived values instead of useEffect + setState
  const displayValues = useMemo(() => {
    return values.filter((v) => v.trim() !== "");
  }, [values]);

  const handleAddValue = () => {
    setValues([...values, ""]);
  };

  const handleRemoveValue = (index: number) => {
    if (values.length > 1) {
      const newValues = values.filter((_, i) => i !== index);
      setValues(newValues);
    } else {
      message.warning("Phải có ít nhất một giá trị");
    }
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleSave = () => {
    const validValues = displayValues;
    if (validValues.length === 0) {
      message.error("Vui lòng nhập ít nhất một giá trị");
      return;
    }
    onSave(validValues);
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial values on cancel
    setValues(initialValues.length > 0 ? [...initialValues] : [""]);
    onClose();
  };

  if (!attribute) return null;

  return (
    <Modal
      key={attribute.slug} // ✅ FIX: Key forces remount when attribute changes, resetting state naturally
      title={`Quản lý giá trị thuộc tính: ${attribute.name}`}
      open={isOpen}
      onCancel={handleCancel}
      onOk={handleSave}
      okText="Lưu"
      cancelText="Hủy"
      width={600}
      destroyOnHidden={true}
      afterClose={() => {
        // ✅ FIX: Reset state when modal closes completely
        setValues(initialValues.length > 0 ? [...initialValues] : [""]);
      }}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          <p>Loại dữ liệu: {attribute.data_type === 1 ? "Text" : "Number"}</p>
          <p>Slug: {attribute.slug}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Giá trị thuộc tính:</label>
            <Button type="dashed" size="small" onClick={handleAddValue}>
              + Thêm giá trị
            </Button>
          </div>

          {values.map((value, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder={`Giá trị ${index + 1}`}
                className="flex-1"
              />
              {values.length > 1 && (
                <Button
                  type="text"
                  danger
                  onClick={() => handleRemoveValue(index)}
                  className="flex-shrink-0"
                >
                  Xóa
                </Button>
              )}
            </div>
          ))}
        </div>

        {displayValues.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium mb-2">Xem trước:</p>
            <div className="flex flex-wrap gap-2">
              {displayValues.map((value, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AttributeValueModal;
