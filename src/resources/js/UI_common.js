/**
 * UI_common.js - 하이코칭 디자인 시스템 (Vanilla JavaScript)
 * 모든 UI 컴포넌트의 기능을 포함합니다.
 */

// ===== 유틸리티 =====
const UICommon = (() => {
  // 고유 ID 생성
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // DOM 선택자 헬퍼
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // ===== 모달/알럿을 body로 이동 =====
  const moveToBody = (element) => {
    if (!element) return;
    // 이미 body 직계 자식이면 이동 안 함
    if (element.parentElement === document.body) return;
    document.body.appendChild(element);
  };

  // ===== 모달 스택 관리 =====
  const modalStack = {
    stack: [],
    listeners: new Set(),

    push(id) {
      if (!this.stack.includes(id)) {
        this.stack.push(id);
        this.notify();
      }
    },

    remove(id) {
      const index = this.stack.indexOf(id);
      if (index > -1) {
        this.stack.splice(index, 1);
        this.notify();
      }
    },

    isTop(id) {
      return this.stack[this.stack.length - 1] === id;
    },

    getZIndex() {
      return 9999 + this.stack.length;
    },

    notify() {
      this.listeners.forEach((fn) => fn());
    },

    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    },
  };

  // ===== 포커스 관리 =====
  const focusManager = {
    stack: [],

    push() {
      this.stack.push(document.activeElement);
    },

    popAndFocus() {
      const el = this.stack.pop();
      if (el && document.body.contains(el)) {
        el.focus();
      }
    },
  };

  // ===== 포커스 트랩 =====
  const focusTrap = {
    currentElement: null,
    keyHandler: null,

    activate(element) {
      this.currentElement = element;

      const focusableEls = element.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableEls.length === 0) {
        element.focus();
        return;
      }

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      this.keyHandler = (e) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      };

      element.addEventListener("keydown", this.keyHandler);
      firstEl.focus();
    },

    deactivate() {
      if (this.currentElement && this.keyHandler) {
        this.currentElement.removeEventListener("keydown", this.keyHandler);
      }
      this.currentElement = null;
      this.keyHandler = null;
    },
  };

  // ===== Input 컴포넌트 =====
  const Input = {
    init(container) {
      const inputs = $$('.input-item input, [data-component="input"] input');
      inputs.forEach((input) => {
        this.setupInput(input);
      });
    },

    setupInput(input) {
      const wrapper = input.closest(".input-field-wrap");
      if (!wrapper) return;

      // 클리어 버튼 처리
      const clearBtn = wrapper.querySelector(".input-clear-btn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          input.value = "";
          input.focus();
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });

        // 입력값 변경 시 클리어 버튼 표시/숨김
        input.addEventListener("input", () => {
          clearBtn.style.display = input.value ? "block" : "none";
        });

        // 초기 상태
        clearBtn.style.display = input.value ? "block" : "none";
      }

      // 에러 상태 관리
      input.addEventListener("input", () => {
        const errorMsg = wrapper.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains("input-error-message")) {
          errorMsg.style.display = "none";
          wrapper.classList.remove("has-error");
        }
      });
    },
  };

  // ===== Modal 컴포넌트 =====
  const Modal = {
    openModals: new Set(),

    open(modalId) {
      const modal = $(`#${modalId}`);
      if (!modal) return;

      // body로 이동
      moveToBody(modal);

      this.openModals.add(modalId);
      modalStack.push(modalId);
      focusManager.push();
      document.activeElement.blur(); // 현재 포커스 해제

      modal.style.display = "flex";
      modal.style.zIndex = 9999 + this.openModals.size;

      // 백드랍 스타일 업데이트
      const backdrop = modal;
      if (modalStack.isTop(modalId)) {
        backdrop.classList.add("backdrop-active");
        backdrop.setAttribute("data-top-modal", "true");
      } else {
        backdrop.classList.remove("backdrop-active");
        backdrop.setAttribute("data-top-modal", "false");
      }

      document.body.style.overflow = "hidden";
      const wrap = $(".wrap");
      if (wrap) wrap.setAttribute("aria-hidden", "true");

      // 포커스 트랩 활성화
      const modalContent = modal.querySelector(".modal-content");
      if (modalContent) {
        focusTrap.activate(modalContent);
      }

      this.setupKeyhandlers(modal, modalId);
    },

    close(modalId) {
      const modal = $(`#${modalId}`);
      if (!modal) return;

      modal.style.display = "none";
      modal.classList.remove("backdrop-active");
      this.openModals.delete(modalId);

      // 포커스 트랩 해제
      focusTrap.deactivate();

      // 남은 모달이 있으면 배경 유지, 없으면 제거
      modalStack.remove(modalId);

      if (modalStack.stack.length === 0) {
        document.body.style.overflow = "";
        const wrap = $(".wrap");
        if (wrap) wrap.removeAttribute("aria-hidden");
      } else {
        // 다른 모달 백드랍 업데이트
        const topModalId = modalStack.stack[modalStack.stack.length - 1];
        const topModal = $(`#${topModalId}`);
        if (topModal) {
          topModal.classList.add("backdrop-active");
          topModal.setAttribute("data-top-modal", "true");
        }
      }

      focusManager.popAndFocus();
    },

    setupKeyhandlers(modal, modalId) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape" && modalStack.isTop(modalId)) {
          e.preventDefault();
          this.close(modalId);
        }
      };

      modal.addEventListener("keydown", handleKeyDown);
      modal._keyHandler = handleKeyDown;
    },
  };

  // ===== SystemAlert 컴포넌트 =====
  const SystemAlert = {
    openAlerts: new Set(),

    show(alertId) {
      const alert = $(`#${alertId}`);
      if (!alert) return;

      // body로 이동
      moveToBody(alert);

      this.openAlerts.add(alertId);
      modalStack.push(alertId);
      focusManager.push();
      document.activeElement.blur(); // 현재 포커스 해제

      alert.style.display = "flex";
      alert.style.zIndex = 9999 + this.openAlerts.size;

      // 백드랍 스타일 업데이트
      const backdrop = alert;
      if (modalStack.isTop(alertId)) {
        backdrop.classList.add("backdrop-active");
        backdrop.setAttribute("data-top-modal", "true");
      } else {
        backdrop.classList.remove("backdrop-active");
        backdrop.setAttribute("data-top-modal", "false");
      }

      document.body.style.overflow = "hidden";
      const wrap = $(".wrap");
      if (wrap) wrap.setAttribute("aria-hidden", "true");

      // 포커스 트랩 활성화
      focusTrap.activate(alert);

      this.setupKeyhandlers(alert, alertId);
    },

    hide(alertId) {
      const alert = $(`#${alertId}`);
      if (!alert) return;

      alert.style.display = "none";
      alert.classList.remove("backdrop-active");
      this.openAlerts.delete(alertId);

      // 포커스 트랩 해제
      focusTrap.deactivate();

      // 남은 모달이 있으면 배경 유지, 없으면 제거
      modalStack.remove(alertId);

      if (modalStack.stack.length === 0) {
        document.body.style.overflow = "";
        const wrap = $(".wrap");
        if (wrap) wrap.removeAttribute("aria-hidden");
      } else {
        // 다른 모달 백드랍 업데이트
        const topModalId = modalStack.stack[modalStack.stack.length - 1];
        const topAlert = $(`#${topModalId}`);
        if (topAlert) {
          topAlert.classList.add("backdrop-active");
          topAlert.setAttribute("data-top-modal", "true");
        }
      }

      focusManager.popAndFocus();
    },

    setupKeyhandlers(alert, alertId) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape" && modalStack.isTop(alertId)) {
          e.preventDefault();
          this.hide(alertId);
        }
      };

      alert.addEventListener("keydown", handleKeyDown);
    },
  };

  // ===== Toast 컴포넌트 =====
  const Toast = {
    show(message, duration = 3000) {
      const toastId = generateId();
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.id = toastId;
      toast.textContent = message;
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");

      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.add("show");
      });

      setTimeout(() => {
        toast.classList.add("is-hidden");
        setTimeout(() => toast.remove(), 250);
      }, duration);

      return toastId;
    },
  };

  // ===== Accordion 컴포넌트 =====
  const Accordion = {
    init(container) {
      const accordions = $$(
        '.accordion-trigger, [data-component="accordion"] .accordion-trigger'
      );
      accordions.forEach((trigger) => {
        this.setupTrigger(trigger);
      });
    },

    setupTrigger(trigger) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const item = trigger.closest(".accordion-item");
        if (!item) return;

        const isActive = item.classList.contains("is-active");
        item.classList.toggle("is-active");

        trigger.setAttribute("aria-expanded", !isActive);
      });
    },
  };

  // ===== Tab 컴포넌트 =====
  const Tab = {
    init(container) {
      $$('.btn-tab, [data-component="tab"] .btn-tab').forEach((tab) => {
        this.setupTab(tab);
      });
    },

    setupTab(tab) {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabList = tab.closest(".tab-list");
        const tabId = tab.getAttribute("aria-controls");

        // 같은 탭 그룹의 다른 탭 비활성화
        tabList.querySelectorAll(".btn-tab").forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });

        // 같은 탭 그룹의 다른 콘텐츠 숨김
        const tabContentWrap = tab
          .closest(".tab")
          .querySelector(".tab-content-wrap");
        tabContentWrap.querySelectorAll(".tab-content").forEach((content) => {
          content.classList.remove("is-active");
        });

        // 현재 탭 활성화
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");

        // 현재 콘텐츠 표시
        const content = $(`#${tabId}`);
        if (content) {
          content.classList.add("is-active");
        }
      });

      // 키보드 네비게이션
      tab.addEventListener("keydown", (e) => {
        const tabList = tab.closest(".tab-list");
        const tabs = Array.from(
          tabList.querySelectorAll(".btn-tab:not(:disabled)")
        );
        const index = tabs.indexOf(tab);

        let nextTab;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          nextTab = tabs[(index + 1) % tabs.length];
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          nextTab = tabs[(index - 1 + tabs.length) % tabs.length];
        }

        if (nextTab) {
          nextTab.focus();
          nextTab.click();
        }
      });
    },
  };

  // ===== SelectBox 컴포넌트 =====
  const SelectBox = {
    init() {
      $$(".selectbox-wrapper").forEach((wrapper) => {
        this.setupSelectBox(wrapper);
      });
    },

    setupSelectBox(wrapper) {
      const button = wrapper.querySelector(".selectbox-button");
      const options = wrapper.querySelector(".selectbox-options");

      if (!button || !options) return;

      button.addEventListener("click", () => {
        const isOpen = options.style.display !== "none";
        options.style.display = isOpen ? "none" : "block";
        button.classList.toggle("is-open");
        button.setAttribute("aria-expanded", !isOpen);
      });

      wrapper.querySelectorAll(".selectbox-option").forEach((option) => {
        option.addEventListener("click", () => {
          const value = option.textContent;
          button.textContent = value;
          button.classList.remove("placeholder");
          options.style.display = "none";
          button.classList.remove("is-open");
          button.setAttribute("aria-expanded", "false");

          // 커스텀 이벤트 발행
          wrapper.dispatchEvent(
            new CustomEvent("selectChange", {
              detail: { value: option.getAttribute("data-value") || value },
            })
          );
        });
      });

      // 외부 클릭 시 닫기
      document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
          options.style.display = "none";
          button.classList.remove("is-open");
          button.setAttribute("aria-expanded", "false");
        }
      });
    },
  };

  // ===== TextArea 컴포넌트 =====
  const TextArea = {
    init() {
      $$(".krds-input[data-max-length]").forEach((textarea) => {
        this.setupTextArea(textarea);
      });
    },

    setupTextArea(textarea) {
      const maxLength = parseInt(textarea.getAttribute("data-max-length"));
      const counter = textarea
        .closest(".textarea-wrap")
        ?.querySelector(".char-counter");

      if (counter) {
        textarea.addEventListener("input", () => {
          counter.textContent = `${textarea.value.length} / ${maxLength}`;
        });
        // 초기값
        counter.textContent = `${textarea.value.length} / ${maxLength}`;
      }

      // 클리어 버튼
      const clearBtn = textarea
        .closest(".textarea-wrap")
        ?.querySelector(".textarea-clear-btn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          textarea.value = "";
          textarea.focus();
          if (counter) counter.textContent = `0 / ${maxLength}`;
        });
      }
    },
  };

  // ===== Tooltip 컴포넌트 =====
  const Tooltip = {
    init() {
      $$(".tooltip-trigger").forEach((trigger) => {
        this.setupTooltip(trigger);
      });
    },

    setupTooltip(trigger) {
      const container = trigger.closest(".tooltip-container");
      const tooltip = container?.querySelector(".tooltip-layer");

      if (!tooltip) return;

      trigger.addEventListener("mouseenter", () => {
        tooltip.style.display = "block";
      });

      trigger.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });

      trigger.addEventListener("focus", () => {
        tooltip.style.display = "block";
      });

      trigger.addEventListener("blur", () => {
        tooltip.style.display = "none";
      });
    },
  };

  // ===== Navigation (GNB) 컴포넌트 =====
  const Navigation = {
    isMobile: false,
    mobileMenuBtn: null,
    menuContainer: null,
    menuToggles: [],
    gnbActions: null,

    init() {
      // DOM 요소 선택 (한 번만)
      this.mobileMenuBtn = $("#mobile-menu-toggle");
      this.menuContainer = $("#menu-container");
      this.menuToggles = $$(".menu-toggle");
      this.gnbActions = $(".gnb-actions");

      if (!this.mobileMenuBtn || !this.menuContainer) {
        console.error("Navigation: Required elements not found");
        return;
      }

      console.log("✓ Navigation initialized");
      console.log("  - Mobile btn:", this.mobileMenuBtn);
      console.log("  - Menu container:", this.menuContainer);
      console.log("  - Menu toggles count:", this.menuToggles.length);
      console.log("  - mobileMenuBtn exist:", !!this.mobileMenuBtn);
      console.log("  - menuContainer exist:", !!this.menuContainer);
      console.log("  - menuToggles count:", this.menuToggles.length);

      // 초기 반응형 상태 설정
      this.updateMobileState();

      // 초기 서브메뉴 ARIA 속성 설정
      this.menuToggles.forEach((toggle) => {
        const submenu = document.getElementById(
          toggle.getAttribute("data-submenu")
        );
        if (submenu) {
          toggle.setAttribute(
            "aria-expanded",
            submenu.hidden ? "false" : "true"
          );
        }
      });

      // ===== 모바일 메뉴 버튼 클릭 =====
      this.mobileMenuBtn.addEventListener("click", (e) => {
        console.log("Mobile menu button clicked!");
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu();
      });

      // ===== 서브메뉴 토글 =====
      this.menuToggles.forEach((toggle) => {
        toggle.addEventListener("click", (e) => {
          console.log("Submenu toggle clicked:", toggle.id || toggle.className);
          e.preventDefault();
          e.stopPropagation();
          this.toggleSubmenu(toggle);
        });
      });

      // ===== 메뉴 링크 클릭 시 모바일 메뉴 닫기 =====
      const menuLinks = this.menuContainer.querySelectorAll(".menu-link");
      menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
          if (this.isMobile) {
            this.closeMenu();
          }
        });
      });

      // ===== 서브메뉴 링크 클릭 시 모바일 메뉴 닫기 =====
      const subMenuLinks =
        this.menuContainer.querySelectorAll(".sub-menu-link");
      subMenuLinks.forEach((link) => {
        link.addEventListener("click", () => {
          if (this.isMobile) {
            this.closeMenu();
          }
        });
      });

      // ===== ESC 키로 메뉴 닫기 =====
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeMenu();
        }
      });

      // ===== 외부 클릭 시 메뉴 닫기 =====
      document.addEventListener("click", (e) => {
        const gnb = $(".gnb");
        if (
          gnb &&
          !gnb.contains(e.target) &&
          this.menuContainer.classList.contains("active")
        ) {
          this.closeMenu();
        }
      });

      // ===== 윈도우 리사이즈 감지 =====
      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.updateMobileState();
        }, 150);
      });
    },

    toggleMenu() {
      const isOpen =
        this.mobileMenuBtn.getAttribute("aria-expanded") === "true";

      this.mobileMenuBtn.classList.toggle("active");
      this.mobileMenuBtn.setAttribute("aria-expanded", !isOpen);
      this.mobileMenuBtn.setAttribute(
        "aria-label",
        !isOpen ? "메뉴 닫기" : "메뉴 열기"
      );
      this.menuContainer.classList.toggle("active");

      // gnb-actions hide 토글
      if (this.gnbActions) {
        this.gnbActions.classList.toggle("hide");
      }

      console.log("Menu toggled:", !isOpen);
      console.log(
        "  - mobileMenuBtn active class:",
        this.mobileMenuBtn.classList.contains("active")
      );
      console.log(
        "  - menuContainer active class:",
        this.menuContainer.classList.contains("active")
      );
      if (this.gnbActions) {
        console.log(
          "  - gnbActions hide class:",
          this.gnbActions.classList.contains("hide")
        );
      }

      // 메뉴 열릴 때 첫 번째 링크에 포커스
      if (!isOpen) {
        const firstLink = this.menuContainer.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    },

    toggleSubmenu(toggle) {
      const submenuId = toggle.getAttribute("data-submenu");
      const submenu = document.getElementById(submenuId);
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      if (!submenu) {
        console.error("Submenu not found:", submenuId);
        return;
      }

      // 모바일에서만 다른 서브메뉴 닫기
      if (this.isMobile) {
        this.menuToggles.forEach((other) => {
          if (other !== toggle) {
            other.setAttribute("aria-expanded", "false");
            const otherSubmenu = document.getElementById(
              other.getAttribute("data-submenu")
            );
            if (otherSubmenu) {
              otherSubmenu.hidden = true;
            }
          }
        });
      }

      // 현재 서브메뉴 토글
      toggle.setAttribute("aria-expanded", !isOpen);
      submenu.hidden = !isOpen;

      console.log("Submenu toggled:", submenuId, "State:", !isOpen);
      console.log("  - Submenu hidden state:", submenu.hidden);
      console.log(
        "  - Toggle aria-expanded:",
        toggle.getAttribute("aria-expanded")
      );
    },

    closeMenu() {
      this.mobileMenuBtn.classList.remove("active");
      this.mobileMenuBtn.setAttribute("aria-expanded", "false");
      this.mobileMenuBtn.setAttribute("aria-label", "메뉴 열기");
      this.menuContainer.classList.remove("active");

      // gnb-actions hide 제거
      if (this.gnbActions) {
        this.gnbActions.classList.remove("hide");
      }

      // 모든 서브메뉴 닫기
      this.menuToggles.forEach((toggle) => {
        toggle.setAttribute("aria-expanded", "false");
        const submenu = document.getElementById(
          toggle.getAttribute("data-submenu")
        );
        if (submenu) {
          submenu.hidden = true;
        }
      });

      console.log("Menu closed");
    },

    updateMobileState() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 767;

      // 상태가 바뀔 때만 처리
      if (wasMobile !== this.isMobile) {
        console.log("Mobile state changed:", this.isMobile);

        if (!this.isMobile) {
          // 데스크톱으로 변경 시
          this.closeMenu();

          // gnb-actions hide 제거
          if (this.gnbActions) {
            this.gnbActions.classList.remove("hide");
          }

          // 데스크톱에서 서브메뉴 표시 상태로 변경
          this.menuToggles.forEach((toggle) => {
            const submenu = document.getElementById(
              toggle.getAttribute("data-submenu")
            );
            if (submenu) {
              submenu.hidden = false;
            }
          });
        }
      }
    },
  };

  // ===== Loading 컴포넌트 =====
  const Loading = {
    show() {
      const overlay = $(".loading-overlay") || this.create();
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    },

    hide() {
      const overlay = $(".loading-overlay");
      if (overlay) {
        overlay.style.display = "none";
        document.body.style.overflow = "";
      }
    },

    create() {
      const overlay = document.createElement("div");
      overlay.className = "loading-overlay";
      overlay.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(overlay);
      return overlay;
    },
  };

  // ===== 전체 초기화 =====
  const init = (container = document) => {
    Input.init(container);
    Accordion.init(container);
    Tab.init(container);
    SelectBox.init();
    TextArea.init();
    Tooltip.init();
    Navigation.init();
  };

  // Public API
  return {
    // 초기화
    init,

    // 컴포넌트
    Input,
    Accordion,
    Modal,
    SystemAlert,
    Toast,
    Tab,
    SelectBox,
    TextArea,
    Tooltip,
    Loading,
    Navigation,

    // 유틸리티
    $,
    $$,
    generateId,
    modalStack,
    focusManager,
    focusTrap,
  };
})();

// 페이지 로드 후 자동 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => UICommon.init());
} else {
  UICommon.init();
}
