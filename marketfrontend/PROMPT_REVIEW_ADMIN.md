# Prompt Đánh Giá Dự Án Next.js Admin Dashboard

## Prompt Chính

```
Bạn là một Senior Full-Stack Developer chuyên về Next.js, React, và TypeScript. 
Hãy đánh giá toàn diện dự án Admin Dashboard này theo các tiêu chí sau:

## 1. UI/UX ASSESSMENT (Đánh giá Giao diện & Trải nghiệm người dùng)

Hãy kiểm tra và đánh giá:
- ✅ Design System: Có hệ thống màu sắc, spacing, typography nhất quán không?
- ✅ Responsive Design: Mobile-first approach, breakpoints hợp lý?
- ✅ Accessibility: ARIA labels, keyboard navigation, screen reader support?
- ✅ Loading States: Skeleton loaders, loading indicators có đầy đủ?
- ✅ Error Handling: Error boundaries, user-friendly error messages?
- ✅ Toast/Notifications: UX của notification system có tốt không?
- ✅ Form Validation: Real-time validation, clear error messages?
- ✅ Data Visualization: Charts, tables có dễ đọc và tương tác không?
- ✅ Navigation: Sidebar, breadcrumbs, navigation flow có intuitive không?
- ✅ Dark Mode: Implementation có đúng cách không?

## 2. CODE LOGIC & ARCHITECTURE (Đánh giá Logic & Kiến trúc Code)

Hãy phân tích:
- ✅ Code Organization: Folder structure, separation of concerns?
- ✅ TypeScript Usage: Type safety, interfaces, proper typing?
- ✅ State Management: React Query, Context API, local state - có hợp lý?
- ✅ Custom Hooks: Reusability, single responsibility?
- ✅ Component Structure: Atomic design, component composition?
- ✅ Error Handling: Try-catch, error boundaries, error propagation?
- ✅ API Integration: Service layer, error handling, data transformation?
- ✅ Form Handling: Controlled components, validation logic?
- ✅ Business Logic: Separation between UI và business logic?
- ✅ Code Reusability: DRY principle, shared utilities?

## 3. PERFORMANCE OPTIMIZATION (Đánh giá Hiệu năng)

Hãy kiểm tra:
- ✅ React Query: Caching strategy, staleTime, cacheTime settings?
- ✅ Code Splitting: Dynamic imports, route-based splitting?
- ✅ Image Optimization: Next.js Image component, lazy loading?
- ✅ Bundle Size: Tree shaking, unused code elimination?
- ✅ Memoization: useMemo, useCallback được sử dụng đúng chỗ?
- ✅ Virtualization: Large lists có được virtualize không?
- ✅ Debouncing/Throttling: Search, filters có được optimize?
- ✅ SSR/SSG: Server-side rendering strategy hợp lý?
- ✅ Hydration: Hydration mismatches, client-only rendering?
- ✅ Re-renders: Unnecessary re-renders, React DevTools Profiler?

## 4. SCALABILITY & MAINTAINABILITY (Đánh giá Khả năng Mở rộng)

Hãy đánh giá:
- ✅ Project Structure: Có thể scale lên nhiều features không?
- ✅ Configuration Management: Environment variables, config files?
- ✅ Testing Strategy: Unit tests, integration tests, E2E tests?
- ✅ Documentation: Code comments, README, API docs?
- ✅ Error Logging: Error tracking, monitoring setup?
- ✅ Internationalization: i18n support, multi-language?
- ✅ Feature Flags: A/B testing, gradual rollout capability?
- ✅ Database/API: Caching layers, query optimization?
- ✅ Security: Authentication, authorization, input sanitization?
- ✅ CI/CD: Build pipeline, deployment strategy?

## 5. SECURITY (Đánh giá Bảo mật)

Hãy kiểm tra:
- ✅ Authentication: JWT handling, token storage, refresh tokens?
- ✅ Authorization: Role-based access control (RBAC), permission checks?
- ✅ Input Validation: XSS prevention, SQL injection protection?
- ✅ CSRF Protection: CSRF tokens, SameSite cookies?
- ✅ Sensitive Data: API keys, secrets không expose trong client code?
- ✅ HTTPS: Force HTTPS, secure headers?
- ✅ Content Security Policy: CSP headers configured?
- ✅ Dependency Security: Regular security audits, dependency updates?
- ✅ Authentication Flow: Secure login/logout, session management?
- ✅ Data Encryption: Sensitive data encryption in transit/at rest?

## 6. TESTING & QUALITY ASSURANCE (Đánh giá Testing)

Hãy đánh giá:
- ✅ Unit Tests: Component testing, utility function testing?
- ✅ Integration Tests: API integration, component interaction?
- ✅ E2E Tests: Critical user flows, Playwright/Cypress?
- ✅ Test Coverage: Coverage metrics, critical paths covered?
- ✅ Test Maintainability: Test readability, test data management?
- ✅ Visual Regression: Screenshot testing, visual diffs?
- ✅ Accessibility Testing: Automated a11y testing (axe-core)?
- ✅ Cross-browser Testing: Browser compatibility testing?
- ✅ Performance Testing: Load testing, stress testing?
- ✅ Test Automation: CI/CD integration, automated test runs?

## 7. ACCESSIBILITY (Đánh giá Khả năng Truy cập)

Hãy kiểm tra:
- ✅ WCAG Compliance: WCAG 2.1 AA/AAA standards?
- ✅ Semantic HTML: Proper HTML5 semantic elements?
- ✅ ARIA Labels: ARIA attributes, roles, properties?
- ✅ Keyboard Navigation: Tab order, focus management?
- ✅ Screen Reader: Screen reader compatibility?
- ✅ Color Contrast: Sufficient color contrast ratios?
- ✅ Focus Indicators: Visible focus indicators?
- ✅ Alt Text: Image alt text, descriptive text?
- ✅ Form Labels: Proper label associations?
- ✅ Error Announcements: Screen reader error announcements?

## 8. SEO & DISCOVERABILITY (Đánh giá SEO - nếu là public pages)

Hãy đánh giá:
- ✅ Meta Tags: Title, description, Open Graph tags?
- ✅ Structured Data: JSON-LD, Schema.org markup?
- ✅ Sitemap: XML sitemap generation?
- ✅ Robots.txt: Proper robots.txt configuration?
- ✅ URL Structure: Clean, descriptive URLs?
- ✅ Canonical URLs: Canonical tag implementation?
- ✅ Image SEO: Alt text, image optimization?
- ✅ Page Speed: Core Web Vitals, loading performance?
- ✅ Mobile-Friendly: Mobile-first indexing?
- ✅ Social Sharing: Social media meta tags?

## 9. BROWSER COMPATIBILITY (Đánh giá Tương thích trình duyệt)

Hãy kiểm tra:
- ✅ Modern Browsers: Chrome, Firefox, Safari, Edge support?
- ✅ Legacy Support: IE11, older browsers (nếu cần)?
- ✅ Polyfills: Required polyfills included?
- ✅ Feature Detection: Feature detection vs browser detection?
- ✅ CSS Compatibility: CSS vendor prefixes, fallbacks?
- ✅ JavaScript Compatibility: ES6+ features, transpilation?
- ✅ Responsive Testing: Cross-device, cross-browser testing?
- ✅ Progressive Enhancement: Graceful degradation?

## 10. DEVELOPER EXPERIENCE (Đánh giá Trải nghiệm Developer)

Hãy đánh giá:
- ✅ Onboarding: New developer setup time?
- ✅ Code Editor: VS Code configs, extensions?
- ✅ Linting: ESLint, Prettier configuration?
- ✅ TypeScript: Type definitions, IntelliSense?
- ✅ Debugging: Source maps, debugging tools?
- ✅ Hot Reload: Fast refresh, HMR working?
- ✅ Build Time: Fast build times?
- ✅ Error Messages: Clear, actionable error messages?
- ✅ Code Examples: Code examples, patterns?
- ✅ Team Conventions: Coding standards, style guide?

## 11. ANALYTICS & MONITORING (Đánh giá Phân tích & Giám sát)

Hãy kiểm tra:
- ✅ User Analytics: Google Analytics, custom analytics?
- ✅ Performance Monitoring: Real User Monitoring (RUM)?
- ✅ Error Tracking: Sentry, error logging?
- ✅ User Behavior: User flow tracking, heatmaps?
- ✅ Conversion Tracking: Goal tracking, funnel analysis?
- ✅ A/B Testing: Experimentation platform integration?
- ✅ Performance Metrics: Core Web Vitals tracking?
- ✅ Custom Events: Event tracking implementation?
- ✅ Privacy Compliance: GDPR, cookie consent?
- ✅ Data Retention: Analytics data retention policies?

## 12. PROGRESSIVE WEB APP (PWA) - Nếu áp dụng

Hãy đánh giá:
- ✅ Service Worker: Offline functionality?
- ✅ Web App Manifest: PWA manifest file?
- ✅ Install Prompt: Add to home screen?
- ✅ Offline Support: Offline page, cached resources?
- ✅ Push Notifications: Push notification support?
- ✅ Background Sync: Background sync API?
- ✅ App-like Experience: Full-screen, standalone mode?

## 13. INTERNATIONALIZATION (i18n) - Nếu cần đa ngôn ngữ

Hãy kiểm tra:
- ✅ i18n Library: react-i18next, next-intl setup?
- ✅ Translation Management: Translation files organization?
- ✅ Locale Detection: Automatic locale detection?
- ✅ RTL Support: Right-to-left language support?
- ✅ Date/Time Formatting: Locale-aware formatting?
- ✅ Number Formatting: Currency, number formatting?
- ✅ Pluralization: Proper plural forms?
- ✅ Translation Coverage: All strings translated?

## OUTPUT FORMAT

Hãy trả về đánh giá theo format sau:

### 📊 TỔNG QUAN
- **Điểm tổng thể**: X/10
- **Điểm mạnh**: [Liệt kê 3-5 điểm mạnh]
- **Điểm yếu**: [Liệt kê 3-5 điểm cần cải thiện]

### 🎨 UI/UX (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 💻 CODE LOGIC (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### ⚡ PERFORMANCE (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 📈 SCALABILITY (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 🔒 SECURITY (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 🧪 TESTING (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### ♿ ACCESSIBILITY (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 🔍 SEO (X/10) - Nếu áp dụng
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 🌐 BROWSER COMPATIBILITY (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 👨‍💻 DEVELOPER EXPERIENCE (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 📊 ANALYTICS & MONITORING (X/10)
**Điểm mạnh:**
- [Điểm 1]
- [Điểm 2]

**Cần cải thiện:**
- [Vấn đề 1] → [Giải pháp đề xuất]
- [Vấn đề 2] → [Giải pháp đề xuất]

### 🎯 KHUYẾN NGHỊ ƯU TIÊN
1. **[Priority High]** [Vấn đề quan trọng nhất cần fix ngay]
2. **[Priority Medium]** [Vấn đề nên fix trong sprint tiếp theo]
3. **[Priority Low]** [Cải thiện dài hạn]

### 📝 CODE EXAMPLES
Nếu có thể, hãy đưa ra code examples cho các cải thiện quan trọng nhất.
```

## 🎯 ROADMAP & THỨ TỰ ƯU TIÊN

### **PHASE 1: CODE LOGIC & ARCHITECTURE + DEVELOPER EXPERIENCE** (Tuần 1-2) ⭐ **ƯU TIÊN CAO NHẤT**

**Lý do làm trước:**
- ✅ Foundation của toàn bộ dự án - nếu code logic sai, mọi thứ khác sẽ khó maintain
- ✅ Refactor code logic sau khi có nhiều features sẽ rất tốn kém
- ✅ TypeScript, error handling, architecture ảnh hưởng trực tiếp đến developer experience
- ✅ Dễ dàng review và fix khi codebase còn nhỏ
- ✅ Developer Experience tốt giúp team làm việc hiệu quả hơn

**Công việc cụ thể:**
1. **TypeScript Strict Mode**: Enable strict mode, fix type errors
2. **Error Handling**: Implement error boundaries, consistent error handling patterns
3. **API Layer**: Standardize service layer, error handling, data transformation
4. **Custom Hooks**: Refactor hooks theo single responsibility principle
5. **Component Structure**: Áp dụng atomic design, improve reusability
6. **Code Organization**: Refactor folder structure nếu cần
7. **Developer Tools**: Setup ESLint, Prettier, VS Code configs
8. **Documentation**: Basic README, setup instructions

**Kết quả mong đợi:**
- Code dễ đọc, dễ maintain hơn
- Ít bugs hơn nhờ type safety
- Developer velocity tăng lên

---

### **PHASE 2: UI/UX + ACCESSIBILITY** (Tuần 3-4) ⭐ **ƯU TIÊN CAO**

**Lý do làm thứ 2:**
- ✅ User-facing - ảnh hưởng trực tiếp đến user experience
- ✅ Cần code logic ổn định trước khi optimize UI
- ✅ Có thể làm song song với Phase 1 một phần
- ✅ Dễ đo lường impact (user feedback, analytics)
- ✅ Accessibility là requirement pháp lý ở nhiều quốc gia

**Công việc cụ thể:**
1. **Design System**: Tạo design tokens (colors, spacing, typography)
2. **Loading States**: Implement skeleton loaders cho tất cả data fetching
3. **Error UX**: User-friendly error messages, retry mechanisms
4. **Form Validation**: Real-time validation với clear feedback
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
6. **WCAG Compliance**: Đạt WCAG 2.1 AA standards
7. **Responsive**: Mobile-first approach, test trên nhiều devices
8. **Dark Mode**: Hoàn thiện dark mode implementation
9. **Color Contrast**: Đảm bảo contrast ratios đạt chuẩn
10. **Keyboard Navigation**: Full keyboard support

**Kết quả mong đợi:**
- User satisfaction tăng
- Accessibility compliance
- Consistent design language

---

### **PHASE 3: PERFORMANCE + BROWSER COMPATIBILITY** (Tuần 5-6) ⚡ **ƯU TIÊN TRUNG BÌNH**

**Lý do làm thứ 3:**
- ✅ Cần code logic và UI ổn định trước khi optimize
- ✅ Performance optimization thường là iterative process
- ✅ Có thể measure và benchmark sau khi có baseline
- ✅ Một số optimizations (memoization) có thể làm trong Phase 1-2
- ✅ Browser compatibility đảm bảo app chạy tốt trên mọi browser

**Công việc cụ thể:**
1. **React Query**: Optimize caching strategy (staleTime, cacheTime)
2. **Code Splitting**: Dynamic imports cho routes và heavy components
3. **Memoization**: useMemo, useCallback cho expensive computations
4. **Bundle Analysis**: Analyze bundle size, eliminate unused code
5. **Image Optimization**: Next.js Image component, lazy loading
6. **Virtualization**: Implement cho large lists (react-window/react-virtuoso)
7. **Debouncing/Throttling**: Search, filters, scroll handlers
8. **Lighthouse Audit**: Target 90+ scores
9. **Cross-browser Testing**: Test trên Chrome, Firefox, Safari, Edge
10. **Polyfills**: Add polyfills nếu cần support older browsers

**Kết quả mong đợi:**
- Page load time giảm 30-50%
- Lighthouse score > 90
- Better user experience trên slow networks

---

### **PHASE 4: SECURITY + TESTING** (Tuần 7-8) 🔒 **ƯU TIÊN CAO**

**Lý do làm Phase 4:**
- ✅ Security là critical - không thể để sau
- ✅ Testing đảm bảo code quality và prevent regressions
- ✅ Cần codebase ổn định trước khi viết tests
- ✅ Security audit nên làm sớm để fix vulnerabilities

**Công việc cụ thể:**
1. **Security Audit**: Authentication, authorization, input validation
2. **XSS/CSRF Protection**: Implement security headers, CSRF tokens
3. **Dependency Security**: Audit dependencies, update vulnerable packages
4. **Unit Tests**: Component tests, utility function tests (Jest + React Testing Library)
5. **Integration Tests**: API integration, component interaction tests
6. **E2E Tests**: Critical user flows (Playwright/Cypress)
7. **Security Headers**: CSP, HSTS, X-Frame-Options
8. **Input Sanitization**: Sanitize user inputs, prevent injection attacks

---

### **PHASE 5: SCALABILITY & MONITORING** (Tuần 9-10) 📈 **ƯU TIÊN TRUNG BÌNH**

**Lý do làm Phase 5:**
- ✅ Cần codebase ổn định, tested, và secure trước
- ✅ Monitoring giúp detect issues sớm
- ✅ Documentation và CI/CD là ongoing improvements

**Công việc cụ thể:**
1. **Error Logging**: Sentry hoặc similar service setup
2. **Performance Monitoring**: Real User Monitoring (RUM), APM
3. **Analytics**: User analytics, behavior tracking
4. **CI/CD**: GitHub Actions, automated testing, deployment pipeline
5. **Documentation**: Code comments, README, API docs, Storybook
6. **Internationalization**: i18n setup (nếu cần multi-language)
7. **Feature Flags**: Implement feature flag system
8. **Project Structure**: Refactor để scale tốt hơn

---

### **PHASE 6: SEO & OPTIONAL FEATURES** (Tuần 11+) 🌐 **ƯU TIÊN THẤP**

**Lý do làm cuối cùng:**
- ✅ SEO chỉ cần cho public-facing pages
- ✅ PWA là nice-to-have, không phải must-have
- ✅ Có thể implement khi có nhu cầu cụ thể

**Công việc cụ thể:**
1. **SEO**: Meta tags, structured data, sitemap (nếu cần)
2. **PWA**: Service worker, manifest, offline support (nếu cần)
3. **Advanced Analytics**: Custom events, funnel analysis
4. **A/B Testing**: Experimentation platform integration

**Kết quả mong đợi:**
- Code quality metrics tốt hơn
- Faster deployment cycles
- Easier onboarding cho developers mới

---

## 📋 TÓM TẮT THỨ TỰ ƯU TIÊN

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: CODE LOGIC + DEV EXPERIENCE (Tuần 1-2)      │
│  ⭐⭐⭐⭐⭐ CRITICAL - Làm ngay                          │
│  → Foundation, TypeScript, Error Handling, Dev Tools  │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: UI/UX + ACCESSIBILITY (Tuần 3-4)             │
│  ⭐⭐⭐⭐ HIGH - Làm tiếp theo                           │
│  → Design System, Loading States, WCAG Compliance     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: PERFORMANCE + BROWSER COMPAT (Tuần 5-6)     │
│  ⭐⭐⭐ MEDIUM - Optimize sau khi stable               │
│  → Caching, Code Splitting, Cross-browser Testing     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: SECURITY + TESTING (Tuần 7-8)               │
│  ⭐⭐⭐⭐ HIGH - Critical cho production                │
│  → Security Audit, Unit/Integration/E2E Tests        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 5: SCALABILITY + MONITORING (Tuần 9-10)         │
│  ⭐⭐⭐ MEDIUM - Ongoing improvements                  │
│  → Error Logging, Analytics, CI/CD, Documentation     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 6: SEO + OPTIONAL (Tuần 11+)                    │
│  ⭐⭐ LOW - Nice-to-have features                      │
│  → SEO, PWA, Advanced Analytics (nếu cần)             │
└─────────────────────────────────────────────────────────┘
```

## 💡 LƯU Ý QUAN TRỌNG

1. **Không hoàn toàn tuần tự**: Một số tasks có thể làm song song
   - Design System có thể làm trong Phase 1
   - Basic testing có thể setup sớm
   - Performance monitoring nên setup sớm để có baseline

2. **Iterative Approach**: 
   - Mỗi phase nên có review và iteration
   - Không cần hoàn thành 100% mới chuyển phase tiếp theo

3. **Measure Everything**:
   - Setup analytics và monitoring từ đầu
   - Track metrics trước và sau mỗi phase

4. **User Feedback**:
   - Collect user feedback sau Phase 2 (UI/UX)
   - Adjust priorities dựa trên feedback

## Cách Sử Dụng

1. **Copy prompt trên** và paste vào chat với AI
2. **Attach các file quan trọng**:
   - `src/app/admin/layout.tsx`
   - `src/app/admin/page.tsx`
   - `src/components/admin/AdminHeader.tsx`
   - `src/components/admin/AdminSidebar.tsx`
   - `src/hooks/admin/useAdminDashboard.ts`
   - `src/context/ToastContext.tsx`
   - Và các file khác bạn muốn review

3. **Hoặc sử dụng prompt ngắn gọn hơn:**

```
Đánh giá dự án Next.js Admin Dashboard này về:
1. UI/UX: Design system, responsive, accessibility, user experience
2. Code Logic: Architecture, TypeScript, state management, error handling
3. Performance: React Query caching, code splitting, memoization, bundle size
4. Scalability: Project structure, testing, documentation, security

Hãy đưa ra điểm số từng phần (1-10), điểm mạnh/yếu, và khuyến nghị cụ thể với code examples.
```

## Prompt Cho Từng Phần Riêng Lẻ

### Chỉ đánh giá UI/UX:
```
Focus vào UI/UX của admin dashboard:
- Design consistency và design system
- Responsive design và mobile experience  
- Accessibility (WCAG compliance)
- User flow và navigation
- Loading states và error handling UX
- Form validation và feedback
- Data visualization clarity

Đưa ra điểm số và suggestions cụ thể với screenshots/examples nếu có thể.
```

### Chỉ đánh giá Performance:
```
Analyze performance của admin dashboard:
- React Query configuration và caching strategy
- Component re-renders và memoization
- Bundle size và code splitting
- Image optimization
- Large data handling (virtualization)
- Search/filter debouncing

Sử dụng React DevTools Profiler và Lighthouse để đánh giá.
```

### Chỉ đánh giá Code Quality:
```
Review code quality và architecture:
- TypeScript type safety
- Component structure và reusability
- Custom hooks design
- Error handling patterns
- API integration layer
- Business logic separation

Đưa ra code smells, anti-patterns, và refactoring suggestions.
```
