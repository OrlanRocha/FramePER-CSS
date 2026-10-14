/**
 * Frame PER - JavaScript Core
 * Modern UI Interactivity, HTTP Requests, Notifications, and Loaders
 */

(function (window, document) {
    'use strict';

    const FramePER = {
        
        // --- Theme Module ---
        // Follows the OS preference until the user makes an explicit choice
        // (toggle / set), which is then remembered in localStorage.
        Theme: {
            _storageKey: 'frameper_theme',
            _stored: function() {
                try { return localStorage.getItem(this._storageKey); } catch (e) { return null; }
            },
            _systemTheme: function() {
                return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
            },
            init: function() {
                this._apply(this._stored() || this._systemTheme());

                // Keep following the OS while the user has not chosen
                if (window.matchMedia) {
                    const mq = window.matchMedia('(prefers-color-scheme: dark)');
                    const onChange = () => { if (!this._stored()) this._apply(this._systemTheme()); };
                    if (mq.addEventListener) mq.addEventListener('change', onChange);
                    else if (mq.addListener) mq.addListener(onChange);
                }
            },
            _apply: function(theme) {
                document.documentElement.setAttribute('data-theme', theme);
                // Keep any [data-toggle="theme"] switches in sync
                document.querySelectorAll('[data-toggle="theme"]').forEach(toggle => {
                    if (toggle.type === 'checkbox') toggle.checked = (theme === 'dark');
                });
            },
            get: function() {
                return document.documentElement.getAttribute('data-theme') || this._systemTheme();
            },
            // Explicit choice: persisted
            set: function(theme) {
                try { localStorage.setItem(this._storageKey, theme); } catch (e) { /* storage unavailable */ }
                this._apply(theme);
            },
            toggle: function() {
                this.set(this.get() === 'dark' ? 'light' : 'dark');
            },
            // Forget the choice and go back to following the OS
            reset: function() {
                try { localStorage.removeItem(this._storageKey); } catch (e) { /* storage unavailable */ }
                this._apply(this._systemTheme());
            }
        },

        // --- Backgrounds Module ---
        // .bg-interactive-wrapper > .bg-interactive-layer: a spotlight that follows the cursor
        Backgrounds: {
            init: function() {
                document.querySelectorAll('.bg-interactive-wrapper').forEach(wrapper => {
                    const layer = wrapper.querySelector('.bg-interactive-layer');
                    if (!layer) return;

                    wrapper.addEventListener('mousemove', (e) => {
                        const rect = wrapper.getBoundingClientRect();
                        layer.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
                        layer.style.setProperty('--my', (e.clientY - rect.top) + 'px');
                    });
                });
            }
        },

        // --- 1. UI Components (Auto-initialized) ---
        UI: {
            init: function() {
                this.initModals();
                this.initDropdowns();
                this.initAccordions();
                this.initCarousels();
                this.initAlerts();
                this.initTabs();
                this.initOffcanvas();
                this.initCollapse();
                this.initSidebar();
                this.initThemeToggle();
                this.initKeyboard();
                this.initTables();
                this.initContextMenu();
                this.initFormValidator();
                this.initActivityFeed();
                this.initSplitPane();
                this.initTreeView();
                this.initDataGrid();
                this.initKanban();
                this.initTimeline();
                this.initTour();
            },
            initContextMenu: function() {
                if (FramePER.ContextMenu && FramePER.ContextMenu.init) {
                    FramePER.ContextMenu.init();
                }
            },
            initFormValidator: function() {
                if (FramePER.FormValidator && FramePER.FormValidator.init) {
                    FramePER.FormValidator.init();
                }
            },
            initActivityFeed: function() {
                if (FramePER.ActivityFeed && FramePER.ActivityFeed.init) {
                    FramePER.ActivityFeed.init();
                }
            },
            initSplitPane: function() {
                if (FramePER.SplitPane && FramePER.SplitPane.init) {
                    FramePER.SplitPane.init();
                }
            },
            initTreeView: function() {
                if (FramePER.TreeView && FramePER.TreeView.init) {
                    FramePER.TreeView.init();
                }
            },
            initDataGrid: function() {
                if (FramePER.DataGrid && FramePER.DataGrid.init) {
                    FramePER.DataGrid.init();
                }
            },
            initKanban: function() {
                if (FramePER.Kanban && FramePER.Kanban.init) {
                    FramePER.Kanban.init();
                }
            },
            initTimeline: function() {
                if (FramePER.Timeline && FramePER.Timeline.init) {
                    FramePER.Timeline.init();
                }
            },
            initTour: function() {
                if (FramePER.Tour && FramePER.Tour.init) {
                    FramePER.Tour.init();
                }
            },
            initTables: function() {
                document.addEventListener('click', (e) => {
                    const th = e.target.closest('th.sortable');
                    if (!th) return;

                    const table = th.closest('table');
                    if (!table) return;
                    const tbody = table.querySelector('tbody');
                    if (!tbody) return;

                    const colIndex = Array.prototype.indexOf.call(th.parentNode.children, th);
                    const isAsc = !th.classList.contains('sorted-asc');

                    th.parentNode.querySelectorAll('th.sortable').forEach(sibling => {
                        sibling.classList.remove('sorted-asc', 'sorted-desc');
                    });

                    th.classList.add(isAsc ? 'sorted-asc' : 'sorted-desc');

                    const rows = Array.from(tbody.querySelectorAll('tr'));
                    rows.sort((rowA, rowB) => {
                        const cellA = rowA.children[colIndex] ? rowA.children[colIndex].textContent.trim() : '';
                        const cellB = rowB.children[colIndex] ? rowB.children[colIndex].textContent.trim() : '';

                        const numA = parseFloat(cellA.replace(/[^\d.-]/g, ''));
                        const numB = parseFloat(cellB.replace(/[^\d.-]/g, ''));

                        if (!isNaN(numA) && !isNaN(numB) && cellA.match(/[\d]/) && cellB.match(/[\d]/) && !cellA.match(/[a-zA-Z]{3,}/)) {
                            return isAsc ? numA - numB : numB - numA;
                        }

                        return isAsc ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
                    });

                    rows.forEach(row => tbody.appendChild(row));
                });

                document.addEventListener('input', (e) => {
                    const input = e.target.closest('[data-table-filter]');
                    if (!input) return;

                    const targetSelector = input.getAttribute('data-table-filter');
                    const table = document.querySelector(targetSelector);
                    if (!table) return;

                    const query = input.value.toLowerCase().trim();
                    const rows = table.querySelectorAll('tbody tr');

                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        row.style.display = text.indexOf(query) !== -1 ? '' : 'none';
                    });
                });
            },


            // [data-toggle="collapse"][data-target="#menu"] → toggles .active on the target
            // (used by .navbar-toggler to open the mobile menu)
            initCollapse: function() {
                document.querySelectorAll("[data-toggle='collapse']").forEach(trigger => {
                    trigger.addEventListener("click", (e) => {
                        e.preventDefault();
                        const target = document.querySelector(trigger.getAttribute("data-target"));
                        if (!target) return;
                        const open = target.classList.toggle("active");
                        trigger.setAttribute("aria-expanded", open ? "true" : "false");
                    });
                });
            },
            // [data-toggle="sidebar"] → opens the .sidebar drawer (below the lg breakpoint)
            initSidebar: function() {
                const sidebar = document.querySelector(".sidebar");
                if (!sidebar) return;

                let backdrop = document.querySelector(".sidebar-backdrop");
                if (!backdrop) {
                    backdrop = document.createElement("div");
                    backdrop.className = "sidebar-backdrop";
                    document.body.appendChild(backdrop);
                }

                const close = () => { sidebar.classList.remove("show"); backdrop.classList.remove("show"); };
                const open = () => { sidebar.classList.add("show"); backdrop.classList.add("show"); };

                document.querySelectorAll("[data-toggle='sidebar']").forEach(trigger => {
                    trigger.addEventListener("click", (e) => {
                        e.preventDefault();
                        sidebar.classList.contains("show") ? close() : open();
                    });
                });
                backdrop.addEventListener("click", close);
                sidebar.querySelectorAll(".sidebar-link").forEach(link => link.addEventListener("click", close));
            },
            // [data-theme-toggle] → switches between light and dark
            initThemeToggle: function() {
                document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.preventDefault();
                        FramePER.Theme.toggle();
                    });
                });
            },
            // Escape closes the top-most overlay
            initKeyboard: function() {
                document.addEventListener("keydown", (e) => {
                    if (e.key !== "Escape") return;
                    document.querySelectorAll(".modal.show").forEach(m => m.classList.remove("show"));
                    document.querySelectorAll(".offcanvas.show").forEach(o => o.classList.remove("show"));
                    document.querySelectorAll(".offcanvas-backdrop.show, .sidebar.show, .sidebar-backdrop.show").forEach(el => el.classList.remove("show"));
                    document.querySelectorAll(".dropdown-menu.show").forEach(m => m.classList.remove("show"));
                    document.body.style.overflow = "";
                });
            },
            initModals: function() {
                document.addEventListener("click", (e) => {
                    const toggleBtn = e.target.closest("[data-toggle='modal']");
                    const dismissBtn = e.target.closest("[data-dismiss='modal']");

                    if (toggleBtn) {
                        e.preventDefault();
                        const targetSelector = toggleBtn.getAttribute("data-target") || toggleBtn.getAttribute("href");
                        if (targetSelector && targetSelector.startsWith("#")) {
                            const targetModal = document.querySelector(targetSelector);
                            if (targetModal) {
                                document.querySelectorAll(".modal.show").forEach(m => {
                                    if (m !== targetModal) m.classList.remove("show");
                                });
                                targetModal.classList.add("show");
                                document.body.style.overflow = "hidden";
                                return;
                            }
                        }
                    }

                    if (dismissBtn) {
                        e.preventDefault();
                        const currentModal = dismissBtn.closest(".modal");
                        if (currentModal) {
                            currentModal.classList.remove("show");
                            if (!document.querySelector(".modal.show")) {
                                document.body.style.overflow = "";
                            }
                        }
                        return;
                    }

                    if (e.target.classList && e.target.classList.contains("modal") && e.target.classList.contains("show")) {
                        e.target.classList.remove("show");
                        if (!document.querySelector(".modal.show")) {
                            document.body.style.overflow = "";
                        }
                    }
                });
            },
            initDropdowns: function() {
                function checkSubmenuPosition(item) {
                    const sub = item.querySelector('.dropdown-submenu');
                    if (!sub) return;
                    const rect = item.getBoundingClientRect();
                    if (rect.right + 200 > window.innerWidth) {
                        sub.classList.add('submenu-left');
                    } else {
                        sub.classList.remove('submenu-left');
                    }
                }

                document.addEventListener('mouseover', (e) => {
                    const item = e.target.closest('.dropdown-item.has-submenu');
                    if (item) checkSubmenuPosition(item);
                });

                document.addEventListener("click", (e) => {
                    const toggle = e.target.closest(".dropdown-toggle");
                    if (toggle) {
                        e.preventDefault();
                        const parent = toggle.closest(".dropdown");
                        if (parent) {
                            const menu = parent.querySelector(".dropdown-menu");
                            if (menu) {
                                const isShown = menu.classList.contains("show");
                                document.querySelectorAll(".dropdown-menu.show").forEach(m => m.classList.remove("show"));
                                if (!isShown) menu.classList.add("show");
                            }
                        }
                        return;
                    }

                    const subToggle = e.target.closest(".dropdown-item.has-submenu");
                    if (subToggle) {
                        e.preventDefault();
                        e.stopPropagation();
                        checkSubmenuPosition(subToggle);
                        subToggle.classList.toggle("show-submenu");
                        return;
                    }

                    const regularItem = e.target.closest(".dropdown-item:not(.has-submenu)");
                    if (regularItem) {
                        document.querySelectorAll(".dropdown-menu.show").forEach(m => m.classList.remove("show"));
                        return;
                    }

                    if (!e.target.closest(".dropdown-menu")) {
                        document.querySelectorAll(".dropdown-menu.show").forEach(menu => menu.classList.remove("show"));
                    }
                });
            },

            initAccordions: function() {
                if (FramePER.Accordion && FramePER.Accordion.init) {
                    FramePER.Accordion.init();
                }
            },
            initCarousels: function() {
                document.querySelectorAll('.carousel').forEach(carousel => {
                    const inner = carousel.querySelector('.carousel-inner');
                    const items = carousel.querySelectorAll('.carousel-item');
                    const nextBtn = carousel.querySelector('.carousel-control.next');
                    const prevBtn = carousel.querySelector('.carousel-control.prev');
                    const indicators = carousel.querySelectorAll('.carousel-indicators .indicator');
                    let currentIndex = 0;
                    
                    const update = () => {
                        if(inner) inner.style.transform = `translateX(-${currentIndex * 100}%)`;
                        indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentIndex));
                    };
                    
                    if(nextBtn) nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % items.length; update(); });
                    if(prevBtn) prevBtn.addEventListener('click', () => { currentIndex = (currentIndex - 1 + items.length) % items.length; update(); });
                    indicators.forEach((ind, i) => ind.addEventListener('click', () => { currentIndex = i; update(); }));
                });
            },
            initTabs: function() {
                if (FramePER.Tabs && FramePER.Tabs.init) {
                    FramePER.Tabs.init();
                }
            },

            initOffcanvas: function() {
                let backdrop = document.querySelector('.offcanvas-backdrop');
                if(!backdrop) {
                    backdrop = document.createElement('div');
                    backdrop.className = 'offcanvas-backdrop';
                    document.body.appendChild(backdrop);
                }

                const closeAll = () => {
                    document.querySelectorAll('.offcanvas.show').forEach(oc => oc.classList.remove('show'));
                    backdrop.classList.remove('show');
                    document.body.style.overflow = "";
                };

                backdrop.addEventListener('click', closeAll);

                document.querySelectorAll("[data-toggle='offcanvas']").forEach(trigger => {
                    trigger.addEventListener("click", (e) => {
                        e.preventDefault();
                        const targetId = trigger.getAttribute("data-target");
                        const offcanvas = document.querySelector(targetId);
                        if(offcanvas) {
                            offcanvas.classList.add("show");
                            backdrop.classList.add("show");
                            document.body.style.overflow = "hidden";
                        }
                    });
                });

                document.querySelectorAll("[data-dismiss='offcanvas']").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.preventDefault();
                        closeAll();
                    });
                });
            },
            initAlerts: function() {
                document.querySelectorAll("[data-dismiss='alert']").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.preventDefault();
                        const alert = btn.closest(".alert");
                        if(alert) {
                            alert.classList.add("fade-out");
                            setTimeout(() => alert.remove(), 300);
                        }
                    });
                });
            }
        },

        // --- 2. Dynamic Notifications (Toasts) ---
        Notify: {
            container: null,
            _getContainer: function() {
                if(!this.container) {
                    this.container = document.querySelector('.toast-container');
                    if(!this.container) {
                        this.container = document.createElement('div');
                        this.container.className = 'toast-container';
                        document.body.appendChild(this.container);
                    }
                }
                return this.container;
            },
            show: function(title, message, type = 'info', duration = 3000) {
                const container = this._getContainer();
                const toast = document.createElement('div');
                toast.className = `toast toast-${type}`; // Can use types like info, success, error
                
                let iconStr = '<i class="icon icon-info"></i>';
                if(type === 'success') iconStr = '<i class="icon icon-check"></i>';
                if(type === 'error') iconStr = '<i class="icon icon-close"></i>';

                toast.innerHTML = `
                    <div class="toast-header">
                        <span>${iconStr} ${title}</span>
                        <button class="toast-close"><i class="icon icon-close"></i></button>
                    </div>
                    <div class="toast-body">${message}</div>
                `;
                container.appendChild(toast);
                
                // Animate in
                requestAnimationFrame(() => toast.classList.add('show'));
                
                // Close event
                toast.querySelector('.toast-close').addEventListener('click', () => {
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 300);
                });
                
                // Auto dismiss
                if(duration > 0) {
                    setTimeout(() => {
                        toast.classList.remove('show');
                        setTimeout(() => toast.remove(), 300);
                    }, duration);
                }
            },
            success: function(title, msg, time) { this.show(title, msg, 'success', time); },
            error: function(title, msg, time) { this.show(title, msg, 'error', time); },
            info: function(title, msg, time) { this.show(title, msg, 'info', time); }
        },

        // --- 2.1 Dynamic Interactive Dialogs (Prompt, Confirm, Alert) ---
        Dialog: {
            prompt: function(options = {}) {
                if (typeof document === 'undefined' || !document.createElement) return Promise.resolve(null);
                return new Promise((resolve) => {
                    const title = options.title || 'Informação';
                    const message = options.message || options.label || '';
                    const defaultValue = options.defaultValue !== undefined ? options.defaultValue : '';
                    const placeholder = options.placeholder || '';
                    const confirmText = options.confirmText || 'Confirmar';
                    const cancelText = options.cancelText || 'Cancelar';

                    const modal = document.createElement('div');
                    modal.className = 'modal show';
                    modal.setAttribute('role', 'dialog');
                    modal.setAttribute('aria-modal', 'true');
                    modal.style.zIndex = '9999';

                    modal.innerHTML = `
                        <div class="modal-content" style="max-width: 440px; box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.5)); border: 1px solid var(--border-color, #333);">
                            <div class="modal-header">
                                <h3 class="modal-title">${title}</h3>
                                <button type="button" class="modal-close" aria-label="Fechar"><i class="icon icon-close"></i></button>
                            </div>
                            <div class="modal-body">
                                ${message ? `<p class="m-b-2" style="color: var(--text-main, #eee); font-size: 0.95rem;">${message}</p>` : ''}
                                <div class="form-group m-0">
                                    <input type="text" class="form-control form-control-md dialog-input" value="${String(defaultValue).replace(/"/g, '&quot;')}" placeholder="${placeholder}" />
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-ghost btn-sm dialog-cancel">${cancelText}</button>
                                <button type="button" class="btn btn-primary btn-sm dialog-confirm">${confirmText}</button>
                            </div>
                        </div>
                    `;

                    document.body.appendChild(modal);
                    const input = modal.querySelector('.dialog-input');
                    const confirmBtn = modal.querySelector('.dialog-confirm');
                    const cancelBtn = modal.querySelector('.dialog-cancel');
                    const closeBtn = modal.querySelector('.modal-close');

                    let closed = false;
                    const cleanup = (val) => {
                        if (closed) return;
                        closed = true;
                        modal.classList.remove('show');
                        setTimeout(() => modal.remove(), 200);
                        resolve(val);
                    };

                    if (confirmBtn) confirmBtn.addEventListener('click', () => cleanup(input ? input.value : null));
                    if (cancelBtn) cancelBtn.addEventListener('click', () => cleanup(null));
                    if (closeBtn) closeBtn.addEventListener('click', () => cleanup(null));
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) cleanup(null);
                    });

                    if (input) {
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                cleanup(input.value);
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                cleanup(null);
                            }
                        });
                        setTimeout(() => {
                            if (input.focus) input.focus();
                            if (input.select) input.select();
                        }, 50);
                    }
                });
            },

            confirm: function(options = {}) {
                if (typeof document === 'undefined' || !document.createElement) return Promise.resolve(false);
                return new Promise((resolve) => {
                    const title = options.title || 'Confirmação';
                    const message = options.message || 'Tem certeza que deseja prosseguir?';
                    const confirmText = options.confirmText || 'Confirmar';
                    const cancelText = options.cancelText || 'Cancelar';
                    const isDanger = options.danger !== false;

                    const modal = document.createElement('div');
                    modal.className = 'modal show';
                    modal.setAttribute('role', 'dialog');
                    modal.setAttribute('aria-modal', 'true');
                    modal.style.zIndex = '9999';

                    modal.innerHTML = `
                        <div class="modal-content" style="max-width: 440px; box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.5)); border: 1px solid var(--border-color, #333);">
                            <div class="modal-header">
                                <h3 class="modal-title">${title}</h3>
                                <button type="button" class="modal-close" aria-label="Fechar"><i class="icon icon-close"></i></button>
                            </div>
                            <div class="modal-body">
                                <p class="m-0" style="color: var(--text-main, #eee); font-size: 0.95rem; line-height: 1.5;">${message}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-ghost btn-sm dialog-cancel">${cancelText}</button>
                                <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} btn-sm dialog-confirm">${confirmText}</button>
                            </div>
                        </div>
                    `;

                    document.body.appendChild(modal);
                    const confirmBtn = modal.querySelector('.dialog-confirm');
                    const cancelBtn = modal.querySelector('.dialog-cancel');
                    const closeBtn = modal.querySelector('.modal-close');

                    let closed = false;
                    const cleanup = (val) => {
                        if (closed) return;
                        closed = true;
                        modal.classList.remove('show');
                        setTimeout(() => modal.remove(), 200);
                        resolve(val);
                    };

                    if (confirmBtn) confirmBtn.addEventListener('click', () => cleanup(true));
                    if (cancelBtn) cancelBtn.addEventListener('click', () => cleanup(false));
                    if (closeBtn) closeBtn.addEventListener('click', () => cleanup(false));
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) cleanup(false);
                    });

                    const handleKey = (e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            if (document.removeEventListener) document.removeEventListener('keydown', handleKey);
                            cleanup(false);
                        }
                    };
                    if (document.addEventListener) document.addEventListener('keydown', handleKey);
                    setTimeout(() => { if (confirmBtn && confirmBtn.focus) confirmBtn.focus(); }, 50);
                });
            },

            alert: function(options = {}) {
                if (typeof document === 'undefined' || !document.createElement) return Promise.resolve();
                return new Promise((resolve) => {
                    const title = typeof options === 'string' ? 'Aviso' : (options.title || 'Aviso');
                    const message = typeof options === 'string' ? options : (options.message || '');
                    const confirmText = options.confirmText || 'OK';

                    const modal = document.createElement('div');
                    modal.className = 'modal show';
                    modal.setAttribute('role', 'dialog');
                    modal.setAttribute('aria-modal', 'true');
                    modal.style.zIndex = '9999';

                    modal.innerHTML = `
                        <div class="modal-content" style="max-width: 420px; box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.5)); border: 1px solid var(--border-color, #333);">
                            <div class="modal-header">
                                <h3 class="modal-title">${title}</h3>
                                <button type="button" class="modal-close" aria-label="Fechar"><i class="icon icon-close"></i></button>
                            </div>
                            <div class="modal-body">
                                <p class="m-0" style="color: var(--text-main, #eee); font-size: 0.95rem; line-height: 1.5;">${message}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary btn-sm dialog-confirm">${confirmText}</button>
                            </div>
                        </div>
                    `;

                    document.body.appendChild(modal);
                    const confirmBtn = modal.querySelector('.dialog-confirm');
                    const closeBtn = modal.querySelector('.modal-close');

                    let closed = false;
                    const cleanup = () => {
                        if (closed) return;
                        closed = true;
                        modal.classList.remove('show');
                        setTimeout(() => modal.remove(), 200);
                        resolve();
                    };

                    if (confirmBtn) confirmBtn.addEventListener('click', cleanup);
                    if (closeBtn) closeBtn.addEventListener('click', cleanup);
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) cleanup();
                    });
                    setTimeout(() => { if (confirmBtn && confirmBtn.focus) confirmBtn.focus(); }, 50);
                });
            }
        },

        // --- 3. Page & Element Loaders ---
        Loader: {
            pageOverlay: null,
            showPageLoad: function() {
                if(!this.pageOverlay) {
                    this.pageOverlay = document.createElement('div');
                    this.pageOverlay.className = 'page-loader-overlay';
                    this.pageOverlay.innerHTML = '<div class="spinner spinner-xl text-blue"></div>';
                    document.body.appendChild(this.pageOverlay);
                }
                this.pageOverlay.classList.add('show');
            },
            hidePageLoad: function() {
                if(this.pageOverlay) {
                    this.pageOverlay.classList.remove('show');
                    setTimeout(() => {
                        if(this.pageOverlay) this.pageOverlay.remove();
                        this.pageOverlay = null;
                    }, 300);
                }
            },
            // Add a spinner inside a button
            buttonLoading: function(btnElement, isLoading = true) {
                if(isLoading) {
                    btnElement.setAttribute('disabled', 'true');
                    btnElement.dataset.originalText = btnElement.innerHTML;
                    btnElement.innerHTML = '<span class="spinner spinner-sm"></span> Carregando...';
                } else {
                    btnElement.removeAttribute('disabled');
                    btnElement.innerHTML = btnElement.dataset.originalText || '';
                }
            }
        },

        
        // --- 4. Security Utilities ---
        Security: {
            escapeHTML: function(str) {
                if(typeof str !== 'string') return str;
                return str.replace(/[&<>'"]/g, 
                    tag => ({
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        "'": '&#39;',
                        '"': '&quot;'
                    }[tag] || tag)
                );
            }
        },

        // --- 5. HTTP / AJAX Requests (Fetch API Wrapper) ---
        Http: {
            getCsrfToken: function() {
                const meta = document.querySelector('meta[name="csrf-token"]');
                return meta ? meta.content : '';
            },
            
            _request: async function(url, options = {}) {
                // Automatic offline detection
                if (!navigator.onLine) {
                    FramePER.Notify.error('Sem conexão', 'Você está offline. Verifique sua conexão com a internet.');
                    return { ok: false, error: 'Offline', status: 0 };
                }

                // Automatic CSRF protection for mutations
                if (options.method && options.method !== 'GET' && options.method !== 'HEAD') {
                    if (!options.headers) options.headers = {};
                    const token = this.getCsrfToken();
                    if (token && !options.headers['X-CSRF-TOKEN']) {
                        options.headers['X-CSRF-TOKEN'] = token;
                    }
                }

                try {
                    const response = await fetch(url, options);
                    
                    let data = null;
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        data = await response.json();
                    } else {
                        data = await response.text();
                    }

                    // Security: Automatic handling of common HTTP Status Errors
                    if (!response.ok) {
                        const errorMsg = (data && (data.message || data.error)) || 'Erro inesperado na requisição';
                        
                        if (response.status === 401) {
                            FramePER.Notify.error('Acesso Negado', 'Sua sessão expirou ou você precisa se autenticar.');
                        } else if (response.status === 403) {
                            FramePER.Notify.error('Proibido', 'Você não tem permissão para realizar esta ação.');
                        } else if (response.status === 404) {
                            FramePER.Notify.error('Não Encontrado', 'O recurso solicitado não existe no servidor.');
                        } else if (response.status >= 500) {
                            FramePER.Notify.error('Erro no Servidor', 'Ocorreu um erro interno. Tente novamente mais tarde.');
                        } else {
                            // General 4xx errors
                            FramePER.Notify.error('Atenção', errorMsg);
                        }
                        
                        return { ok: false, error: errorMsg, status: response.status, data };
                    }
                    
                    return { ok: true, data, status: response.status };
                } catch(error) {
                    FramePER.Notify.error('Erro de Rede', 'Não foi possível conectar ao servidor.');
                    return { ok: false, error: error.message, status: 0 };
                }
            },
            get: function(url, headers = {}) {
                return this._request(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...headers } });
            },
            post: function(url, body, headers = {}) {
                return this._request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...headers } });
            },
            put: function(url, body, headers = {}) {
                return this._request(url, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...headers } });
            },
            delete: function(url, headers = {}) {
                return this._request(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...headers } });
            }
        },

        // --- 6. Clipboard Module ---
        Clipboard: {
            copy: function(text, successMsg = 'Copiado para a área de transferência!') {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => {
                        FramePER.Notify.success('Copiado', successMsg);
                    }).catch(() => {
                        this._fallbackCopy(text, successMsg);
                    });
                } else {
                    this._fallbackCopy(text, successMsg);
                }
            },
            _fallbackCopy: function(text, successMsg) {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try {
                    document.execCommand('copy');
                    FramePER.Notify.success('Copiado', successMsg);
                } catch(e) {
                    FramePER.Notify.error('Falha', 'Não foi possível copiar.');
                }
                ta.remove();
            },
            init: function() {
                document.addEventListener('click', (e) => {
                    const btn = e.target.closest('[data-copy]');
                    if (!btn) return;
                    e.preventDefault();
                    let text = btn.getAttribute('data-copy');
                    const targetSel = btn.getAttribute('data-copy-target');
                    if (targetSel) {
                        const targetEl = document.querySelector(targetSel);
                        if (targetEl) text = targetEl.value !== undefined ? targetEl.value : targetEl.textContent.trim();
                    }
                    if (text) FramePER.Clipboard.copy(text);
                });
            }
        },

        // --- 7. Form Masks & Input Helpers ---
        Form: {
            masks: {
                cpf: function(v) {
                    return v.replace(/\D/g, '')
                            .replace(/(\d{3})(\d)/, '$1.$2')
                            .replace(/(\d{3})(\d)/, '$1.$2')
                            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                            .substring(0, 14);
                },
                cnpj: function(v) {
                    return v.replace(/\D/g, '')
                            .replace(/^(\d{2})(\d)/, '$1.$2')
                            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                            .replace(/\.(\d{3})(\d)/, '.$1/$2')
                            .replace(/(\d{4})(\d)/, '$1-$2')
                            .substring(0, 18);
                },
                phone: function(v) {
                    v = v.replace(/\D/g, '');
                    if (v.length > 10) {
                        return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                    } else if (v.length > 5) {
                        return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                    } else if (v.length > 2) {
                        return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                    }
                    return v;
                },
                cep: function(v) {
                    return v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
                },
                date: function(v) {
                    return v.replace(/\D/g, '')
                            .replace(/(\d{2})(\d)/, '$1/$2')
                            .replace(/(\d{2})(\d)/, '$1/$2')
                            .substring(0, 10);
                },
                money: function(v) {
                    v = v.replace(/\D/g, '');
                    if (!v) return '';
                    const n = (parseFloat(v) / 100).toFixed(2);
                    if (isNaN(n)) return '';
                    return 'R$ ' + n.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                }
            },
            init: function() {
                document.addEventListener('input', (e) => {
                    const input = e.target.closest('[data-mask]');
                    if (!input) return;
                    const maskType = input.getAttribute('data-mask');
                    const fn = this.masks[maskType];
                    if (fn) {
                        input.value = fn(input.value);
                    }
                });

                document.addEventListener('click', (e) => {
                    const btn = e.target.closest('[data-toggle="password"]');
                    if (!btn) return;
                    e.preventDefault();
                    const targetSel = btn.getAttribute('data-target');
                    const input = targetSel ? document.querySelector(targetSel) : btn.previousElementSibling;
                    if (input && input.type) {
                        const isPass = input.type === 'password';
                        input.type = isPass ? 'text' : 'password';
                        const icon = btn.querySelector('.icon');
                        if (icon) {
                            icon.classList.toggle('icon-eye', !isPass);
                            icon.classList.toggle('icon-eye-off', isPass);
                        }
                    }
                });
            }
        },

        // --- 8. Animated Counters ---
        Counter: {
            animate: function(el, target, duration = 1200) {
                const start = 0;
                const startTime = performance.now();
                const isFloat = target.toString().includes('.');
                const prefix = el.getAttribute('data-counter-prefix') || '';
                const suffix = el.getAttribute('data-counter-suffix') || '';

                const step = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const current = start + (target - start) * ease;

                    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current).toLocaleString('pt-BR')) + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(step);
                    }
                };
                requestAnimationFrame(step);
            },
            init: function() {
                const elements = document.querySelectorAll('[data-counter]');
                if (!elements.length) return;

                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                                entry.target.classList.add('counted');
                                const targetVal = parseFloat(entry.target.getAttribute('data-counter'));
                                if (!isNaN(targetVal)) {
                                    FramePER.Counter.animate(entry.target, targetVal);
                                }
                            }
                        });
                    }, { threshold: 0.2 });

                    elements.forEach(el => observer.observe(el));
                } else {
                    elements.forEach(el => {
                        const val = parseFloat(el.getAttribute('data-counter'));
                        if (!isNaN(val)) el.textContent = val.toLocaleString('pt-BR');
                    });
                }
            }
        },

        // --- 9. Scroll Helpers ---
        Scroll: {
            toTop: function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            init: function() {
                const backToTopBtns = document.querySelectorAll('[data-scroll-top]');
                if (backToTopBtns.length) {
                    const checkScroll = () => {
                        const show = window.scrollY > 300;
                        backToTopBtns.forEach(btn => {
                            btn.style.opacity = show ? '1' : '0';
                            btn.style.pointerEvents = show ? 'auto' : 'none';
                            btn.style.transition = 'opacity 0.2s var(--ease)';
                        });
                    };
                    window.addEventListener('scroll', checkScroll);
                    checkScroll();

                    document.addEventListener('click', (e) => {
                        if (e.target.closest('[data-scroll-top]')) {
                            e.preventDefault();
                            FramePER.Scroll.toTop();
                        }
                    });
                }

                document.addEventListener('click', (e) => {
                    const anchor = e.target.closest('[data-scroll-to]');
                    if (!anchor) return;
                    const targetSel = anchor.getAttribute('data-scroll-to');
                    const targetEl = document.querySelector(targetSel);
                    if (targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }
        },

        // --- 10. Interactive SVG Charts Framework ---
        Chart: (function() {
            const SVG_NS = 'http://www.w3.org/2000/svg';
            const DEFAULT_PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b'];

            function createSVG(tag, attrs = {}) {
                const el = document.createElementNS(SVG_NS, tag);
                for (const [k, v] of Object.entries(attrs)) {
                    if (v !== undefined && v !== null) el.setAttribute(k, v);
                }
                return el;
            }

            function calculateNiceTicks(min, max, maxTicks = 5) {
                if (min === max) {
                    if (min === 0) { max = 10; }
                    else { min = min > 0 ? 0 : min * 2; max = max > 0 ? max * 1.5 : 0; }
                }
                if (min > 0 && min < max * 0.25) min = 0;
                const range = max - min;
                const roughStep = range / (maxTicks - 1);
                const exponent = Math.floor(Math.log10(Math.max(roughStep, 0.0001)));
                const fraction = roughStep / Math.pow(10, exponent);
                let niceFraction = 10;
                if (fraction <= 1.5) niceFraction = 1;
                else if (fraction <= 3) niceFraction = 2;
                else if (fraction <= 7) niceFraction = 5;
                const niceStep = niceFraction * Math.pow(10, exponent);
                const niceMin = Math.floor(min / niceStep) * niceStep;
                const niceMax = Math.ceil(max / niceStep) * niceStep;
                const ticks = [];
                for (let v = niceMin; v <= niceMax + niceStep * 0.01; v += niceStep) {
                    ticks.push(Number(v.toFixed(6)));
                }
                return { min: niceMin, max: niceMax, ticks };
            }

            function getSplinePath(points) {
                if (!points || !points.length) return '';
                if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
                if (points.length === 2) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
                let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
                for (let i = 0; i < points.length - 1; i++) {
                    const p0 = i > 0 ? points[i - 1] : points[i];
                    const p1 = points[i];
                    const p2 = points[i + 1];
                    const p3 = i < points.length - 2 ? points[i + 2] : p2;
                    const cp1x = p1.x + (p2.x - p0.x) / 6;
                    const cp1y = p1.y + (p2.y - p0.y) / 6;
                    const cp2x = p2.x - (p3.x - p1.x) / 6;
                    const cp2y = p2.y - (p3.y - p1.y) / 6;
                    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
                }
                return d;
            }

            function getLinearPath(points) {
                if (!points || !points.length) return '';
                return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
            }

            function describeDonutSlice(cx, cy, innerR, outerR, startAngle, endAngle) {
                const angleDiff = endAngle - startAngle;
                if (angleDiff >= 360) endAngle = startAngle + 359.999;
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (endAngle - 90) * Math.PI / 180;
                const x1 = cx + outerR * Math.cos(startRad);
                const y1 = cy + outerR * Math.sin(startRad);
                const x2 = cx + outerR * Math.cos(endRad);
                const y2 = cy + outerR * Math.sin(endRad);
                const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

                if (innerR <= 0) {
                    return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
                }
                const x3 = cx + innerR * Math.cos(endRad);
                const y3 = cy + innerR * Math.sin(endRad);
                const x4 = cx + innerR * Math.cos(startRad);
                const y4 = cy + innerR * Math.sin(startRad);
                return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
            }

            function describeArc(cx, cy, r, startAngle, endAngle) {
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (endAngle - 90) * Math.PI / 180;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
                return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
            }

            function formatVal(val, fmt) {
                if (typeof fmt === 'function') return fmt(val);
                if (val === undefined || val === null || isNaN(val)) return '0';
                const n = Number(val);
                if (fmt === 'currency') {
                    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                }
                if (fmt === 'percent') {
                    return n.toLocaleString('pt-BR') + '%';
                }
                return n.toLocaleString('pt-BR');
            }

            class FramePERChart {
                constructor(target, config = {}) {
                    this.container = typeof target === 'string' ? document.querySelector(target) : target;
                    if (!this.container) {
                        console.warn('FramePER.Chart: Elemento alvo não encontrado.', target);
                        return;
                    }
                    this.id = 'fpc-' + Math.random().toString(36).substring(2, 9);
                    this.config = Object.assign({}, config);
                    this.type = this.config.type || 'line';
                    this.data = this.config.data || { labels: [], series: [] };
                    this.options = Object.assign({
                        height: this.type === 'sparkline' ? 50 : 280,
                        curved: true,
                        fill: true,
                        showDots: true,
                        showGrid: true,
                        format: 'number',
                        tooltip: true,
                        legend: true,
                        animated: true,
                        donutCutout: 0.65,
                        strokeWidth: 2.5
                    }, this.config.options || {});

                    this._normalizeData();
                    this._setupDOM();
                    this._bindEvents();
                    this.render();

                    if ('ResizeObserver' in window) {
                        this._resizeObserver = new ResizeObserver(() => {
                            this.render();
                        });
                        this._resizeObserver.observe(this.container);
                    }
                }

                _normalizeData() {
                    if (Array.isArray(this.data.series)) {
                        this.series = this.data.series.map((s, idx) => {
                            const color = s.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
                            if (typeof s === 'number') {
                                return { name: this.data.labels ? this.data.labels[idx] || `Item ${idx + 1}` : `Item ${idx + 1}`, value: s, color, hidden: false };
                            }
                            if (s.value !== undefined && s.data === undefined) {
                                return { name: s.name || `Série ${idx + 1}`, value: s.value, color, hidden: !!s.hidden };
                            }
                            const rawData = Array.isArray(s.data) ? s.data : [];
                            return {
                                name: s.name || `Série ${idx + 1}`,
                                type: s.type || (this.type === 'mixed' ? (idx === 0 ? 'bar' : 'line') : this.type),
                                fill: !!s.fill,
                                data: rawData,
                                color,
                                hidden: !!s.hidden
                            };
                        });
                    } else {
                        this.series = [];
                    }
                    this.labels = Array.isArray(this.data.labels) ? this.data.labels : [];
                }

                _setupDOM() {
                    this.container.innerHTML = '';
                    this.container.classList.add('frame-chart-container');
                    if (this.type === 'sparkline') {
                        this.container.classList.add('frame-chart-sparkline');
                    }

                    if (this.config.title || this.config.subtitle) {
                        const header = document.createElement('div');
                        header.className = 'frame-chart-header';
                        if (this.config.title) {
                            const title = document.createElement('h4');
                            title.className = 'frame-chart-title';
                            title.textContent = this.config.title;
                            header.appendChild(title);
                        }
                        if (this.config.subtitle) {
                            const sub = document.createElement('span');
                            sub.className = 'frame-chart-subtitle';
                            sub.textContent = this.config.subtitle;
                            header.appendChild(sub);
                        }
                        this.container.appendChild(header);
                    }

                    this.svgWrap = document.createElement('div');
                    this.svgWrap.className = 'frame-chart-svg-wrap';
                    this.svgWrap.style.height = (this.options.height || 280) + 'px';
                    this.container.appendChild(this.svgWrap);

                    this.tooltip = document.createElement('div');
                    this.tooltip.className = 'frame-chart-tooltip';
                    this.container.appendChild(this.tooltip);

                    if (this.options.legend && this.type !== 'sparkline') {
                        this.legendWrap = document.createElement('div');
                        this.legendWrap.className = 'frame-chart-legend';
                        this.container.appendChild(this.legendWrap);
                    }
                }

                _bindEvents() {
                    this._onMouseMove = (e) => this._handleMouseMove(e);
                    this._onMouseLeave = () => this._handleMouseLeave();
                    this.svgWrap.addEventListener('mousemove', this._onMouseMove);
                    this.svgWrap.addEventListener('mouseleave', this._onMouseLeave);
                }

                render() {
                    if (!this.svgWrap) return;
                    this.svgWrap.innerHTML = '';
                    const width = Math.max(this.svgWrap.clientWidth || this.container.clientWidth || 320, 100);
                    const height = this.options.height || (this.type === 'sparkline' ? 50 : 280);

                    this.svg = createSVG('svg', {
                        class: 'frame-chart-svg',
                        viewBox: `0 0 ${width} ${height}`,
                        width: '100%',
                        height: '100%'
                    });
                    this.svgWrap.appendChild(this.svg);

                    this.defs = createSVG('defs');
                    this.svg.appendChild(this.defs);

                    if (this.type === 'line' || this.type === 'area') {
                        this._renderLineArea(width, height);
                    } else if (this.type === 'bar') {
                        this._renderBar(width, height);
                    } else if (this.type === 'mixed') {
                        this._renderMixed(width, height);
                    } else if (this.type === 'horizontal-bar') {
                        this._renderHorizontalBar(width, height);
                    } else if (this.type === 'donut' || this.type === 'pie') {
                        this._renderDonutPie(width, height);
                    } else if (this.type === 'gauge') {
                        this._renderGauge(width, height);
                    } else if (this.type === 'radar') {
                        this._renderRadar(width, height);
                    } else if (this.type === 'sparkline') {
                        this._renderSparkline(width, height);
                    }

                    this._renderLegend();
                }

                _renderLineArea(width, height) {
                    const visibleSeries = this.series.filter(s => !s.hidden && s.data && s.data.length);
                    let allVals = [];
                    visibleSeries.forEach(s => allVals.push(...s.data));
                    if (!allVals.length) allVals = [0, 10];

                    const { min, max, ticks } = calculateNiceTicks(Math.min(...allVals), Math.max(...allVals));
                    const valRange = max - min || 1;

                    // Dynamic left padding based on longest formatted tick string
                    const sampleTicks = ticks.map(t => formatVal(t, this.options.format));
                    const maxTickLen = Math.max(...sampleTicks.map(s => (s || '').length), 1);
                    const dynamicLeft = Math.min(Math.max(Math.ceil(maxTickLen * 7.5) + 18, 50), 96);
                    const padding = { top: 34, right: 24, bottom: 35, left: dynamicLeft };
                    const plotW = width - padding.left - padding.right;
                    const plotH = height - padding.top - padding.bottom;
                    if (plotW <= 0 || plotH <= 0) return;

                    // Grid & Y labels
                    if (this.options.showGrid) {
                        const gridG = createSVG('g', { class: 'frame-chart-grid' });
                        const labelsG = createSVG('g', { class: 'frame-chart-labels' });
                        ticks.forEach(t => {
                            const y = padding.top + plotH - ((t - min) / valRange) * plotH;
                            gridG.appendChild(createSVG('line', { x1: padding.left, y1: y, x2: width - padding.right, y2: y }));
                            const text = createSVG('text', {
                                x: padding.left - 8,
                                y: y + 4,
                                'text-anchor': 'end'
                            });
                            text.textContent = formatVal(t, this.options.format);
                            labelsG.appendChild(text);
                        });
                        this.svg.appendChild(gridG);
                        this.svg.appendChild(labelsG);
                    }

                    // X labels
                    const numPoints = Math.max(this.labels.length, ...visibleSeries.map(s => s.data.length), 1);
                    const stepX = numPoints > 1 ? plotW / (numPoints - 1) : plotW / 2;
                    const xLabelsG = createSVG('g', { class: 'frame-chart-labels' });
                    const isCompact = width < 460 && this.labels.length > 5;
                    this.labels.forEach((lbl, i) => {
                        if (isCompact && i % 2 !== 0 && i !== this.labels.length - 1) {
                            return;
                        }
                        const x = padding.left + (numPoints > 1 ? i * stepX : plotW / 2);
                        const text = createSVG('text', {
                            x,
                            y: height - 10,
                            'text-anchor': 'middle'
                        });
                        text.textContent = lbl;
                        xLabelsG.appendChild(text);
                    });
                    this.svg.appendChild(xLabelsG);

                    // Crosshair guideline
                    this.crosshair = createSVG('line', {
                        class: 'frame-chart-crosshair',
                        y1: padding.top,
                        y2: padding.top + plotH,
                        style: 'opacity: 0'
                    });
                    this.svg.appendChild(this.crosshair);

                    // Plot points and paths
                    this.computedPoints = [];
                    visibleSeries.forEach((s, sIdx) => {
                        const pts = s.data.map((val, i) => {
                            const x = padding.left + (numPoints > 1 ? i * stepX : plotW / 2);
                            const y = padding.top + plotH - ((val - min) / valRange) * plotH;
                            return { x, y, val, label: this.labels[i] || '', seriesName: s.name, color: s.color };
                        });
                        this.computedPoints.push({ series: s, points: pts });

                        // Gradient for Area
                        const isArea = this.type === 'area' || this.options.fill;
                        if (isArea) {
                            const gradId = `${this.id}-grad-${sIdx}`;
                            const grad = createSVG('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
                            grad.appendChild(createSVG('stop', { offset: '0%', 'stop-color': s.color, 'stop-opacity': '0.35' }));
                            grad.appendChild(createSVG('stop', { offset: '100%', 'stop-color': s.color, 'stop-opacity': '0.02' }));
                            this.defs.appendChild(grad);

                            const linePath = this.options.curved ? getSplinePath(pts) : getLinearPath(pts);
                            const baselineY = padding.top + plotH;
                            const areaD = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${baselineY} L ${pts[0].x.toFixed(2)} ${baselineY} Z`;
                            this.svg.appendChild(createSVG('path', {
                                class: 'frame-chart-area' + (this.options.animated !== false ? ' frame-chart-animated' : ''),
                                d: areaD,
                                fill: `url(#${gradId})`
                            }));
                        }

                        // Line stroke
                        const lineD = this.options.curved ? getSplinePath(pts) : getLinearPath(pts);
                        const line = createSVG('path', {
                            class: 'frame-chart-line' + (this.options.animated !== false ? ' frame-chart-animated' : ''),
                            d: lineD,
                            stroke: s.color,
                            'stroke-width': this.options.strokeWidth || 2.5
                        });
                        if (this.options.animated !== false) {
                            try {
                                const len = line.getTotalLength ? line.getTotalLength() : 1200;
                                line.style.strokeDasharray = len;
                                line.style.strokeDashoffset = len;
                            } catch (_) {
                                line.style.strokeDasharray = 1200;
                                line.style.strokeDashoffset = 1200;
                            }
                        }
                        this.svg.appendChild(line);

                        // Dots
                        if (this.options.showDots) {
                            const dotsG = createSVG('g', { class: 'frame-chart-dots' });
                            pts.forEach(p => {
                                const dot = createSVG('circle', {
                                    class: 'frame-chart-dot',
                                    cx: p.x.toFixed(2),
                                    cy: p.y.toFixed(2),
                                    r: 4,
                                    fill: s.color
                                });
                                dotsG.appendChild(dot);
                            });
                            this.svg.appendChild(dotsG);
                        }
                    });

                    this.plotArea = { padding, plotW, plotH, stepX, numPoints, min, max };
                }

                _renderBar(width, height) {
                    const visibleSeries = this.series.filter(s => !s.hidden && s.data && s.data.length);
                    let allVals = [];
                    visibleSeries.forEach(s => allVals.push(...s.data));
                    if (!allVals.length) allVals = [0, 10];

                    const { min, max, ticks } = calculateNiceTicks(Math.min(0, Math.min(...allVals)), Math.max(...allVals));
                    const valRange = max - min || 1;

                    // Dynamic left padding based on longest formatted tick string
                    const sampleTicks = ticks.map(t => formatVal(t, this.options.format));
                    const maxTickLen = Math.max(...sampleTicks.map(s => (s || '').length), 1);
                    const dynamicLeft = Math.min(Math.max(Math.ceil(maxTickLen * 7.5) + 18, 50), 96);
                    const padding = { top: 30, right: 24, bottom: 35, left: dynamicLeft };
                    const plotW = width - padding.left - padding.right;
                    const plotH = height - padding.top - padding.bottom;
                    if (plotW <= 0 || plotH <= 0) return;

                    // Grid & Y labels
                    if (this.options.showGrid) {
                        const gridG = createSVG('g', { class: 'frame-chart-grid' });
                        const labelsG = createSVG('g', { class: 'frame-chart-labels' });
                        ticks.forEach(t => {
                            const y = padding.top + plotH - ((t - min) / valRange) * plotH;
                            gridG.appendChild(createSVG('line', { x1: padding.left, y1: y, x2: width - padding.right, y2: y }));
                            const text = createSVG('text', {
                                x: padding.left - 8,
                                y: y + 4,
                                'text-anchor': 'end'
                            });
                            text.textContent = formatVal(t, this.options.format);
                            labelsG.appendChild(text);
                        });
                        this.svg.appendChild(gridG);
                        this.svg.appendChild(labelsG);
                    }

                    const numCategories = Math.max(this.labels.length, ...visibleSeries.map(s => s.data.length), 1);
                    const catWidth = plotW / numCategories;
                    const numSeries = Math.max(visibleSeries.length, 1);
                    const barGroupWidth = catWidth * 0.72;
                    const singleBarWidth = Math.max(barGroupWidth / numSeries - 3, 4);

                    const xLabelsG = createSVG('g', { class: 'frame-chart-labels' });
                    const isCompact = width < 460 && this.labels.length > 5;
                    this.labels.forEach((lbl, i) => {
                        if (isCompact && i % 2 !== 0 && i !== this.labels.length - 1) {
                            return;
                        }
                        const x = padding.left + i * catWidth + catWidth / 2;
                        const text = createSVG('text', { x, y: height - 10, 'text-anchor': 'middle' });
                        text.textContent = lbl;
                        xLabelsG.appendChild(text);
                    });
                    this.svg.appendChild(xLabelsG);

                    const barsG = createSVG('g', { class: 'frame-chart-bars' });
                    visibleSeries.forEach((s, sIdx) => {
                        s.data.forEach((val, cIdx) => {
                            const catStartX = padding.left + cIdx * catWidth + (catWidth - barGroupWidth) / 2;
                            const barX = catStartX + sIdx * (singleBarWidth + 3);
                            const barH = Math.max(((val - min) / valRange) * plotH, 2);
                            const barY = padding.top + plotH - barH;

                            const rect = createSVG('rect', {
                                class: 'frame-chart-bar' + (this.options.animated !== false ? ' frame-chart-animated' : ''),
                                x: barX.toFixed(2),
                                y: barY.toFixed(2),
                                width: singleBarWidth.toFixed(2),
                                height: barH.toFixed(2),
                                fill: s.color,
                                'data-series': s.name,
                                'data-val': val,
                                'data-label': this.labels[cIdx] || '',
                                'data-color': s.color
                            });
                            rect.addEventListener('mouseenter', (e) => this._showElementTooltip(e, rect, this.labels[cIdx] || '', s.name, val, s.color));
                            rect.addEventListener('mouseleave', () => this.tooltip.classList.remove('active'));
                            barsG.appendChild(rect);
                        });
                    });
                    this.svg.appendChild(barsG);
                }

                _renderMixed(width, height) {
                    const visibleSeries = this.series.filter(s => !s.hidden && s.data && s.data.length);
                    let allVals = [];
                    visibleSeries.forEach(s => allVals.push(...s.data));
                    if (!allVals.length) allVals = [0, 10];

                    const { min, max, ticks } = calculateNiceTicks(Math.min(0, Math.min(...allVals)), Math.max(...allVals));
                    const valRange = max - min || 1;

                    // Dynamic left padding based on longest formatted tick string
                    const sampleTicks = ticks.map(t => formatVal(t, this.options.format));
                    const maxTickLen = Math.max(...sampleTicks.map(s => (s || '').length), 1);
                    const dynamicLeft = Math.min(Math.max(Math.ceil(maxTickLen * 7.5) + 18, 50), 96);
                    const padding = { top: 32, right: 24, bottom: 35, left: dynamicLeft };
                    const plotW = width - padding.left - padding.right;
                    const plotH = height - padding.top - padding.bottom;
                    if (plotW <= 0 || plotH <= 0) return;

                    // Grid & Y labels
                    if (this.options.showGrid) {
                        const gridG = createSVG('g', { class: 'frame-chart-grid' });
                        const labelsG = createSVG('g', { class: 'frame-chart-labels' });
                        ticks.forEach(t => {
                            const y = padding.top + plotH - ((t - min) / valRange) * plotH;
                            gridG.appendChild(createSVG('line', { x1: padding.left, y1: y, x2: width - padding.right, y2: y }));
                            const text = createSVG('text', {
                                x: padding.left - 8,
                                y: y + 4,
                                'text-anchor': 'end'
                            });
                            text.textContent = formatVal(t, this.options.format);
                            labelsG.appendChild(text);
                        });
                        this.svg.appendChild(gridG);
                        this.svg.appendChild(labelsG);
                    }

                    const numCategories = Math.max(this.labels.length, ...visibleSeries.map(s => s.data.length), 1);
                    const catWidth = plotW / numCategories;

                    const xLabelsG = createSVG('g', { class: 'frame-chart-labels' });
                    const isCompact = width < 460 && this.labels.length > 5;
                    this.labels.forEach((lbl, i) => {
                        if (isCompact && i % 2 !== 0 && i !== this.labels.length - 1) {
                            return;
                        }
                        const x = padding.left + i * catWidth + catWidth / 2;
                        const text = createSVG('text', { x, y: height - 10, 'text-anchor': 'middle' });
                        text.textContent = lbl;
                        xLabelsG.appendChild(text);
                    });
                    this.svg.appendChild(xLabelsG);

                    // Separate bar and line series
                    const barSeries = visibleSeries.filter(s => s.type === 'bar');
                    const lineSeries = visibleSeries.filter(s => s.type !== 'bar');

                    // 1. Render Bar series
                    if (barSeries.length > 0) {
                        const numBarSeries = barSeries.length;
                        const barGroupWidth = catWidth * 0.65;
                        const singleBarWidth = Math.max(barGroupWidth / numBarSeries - 3, 4);
                        const barsG = createSVG('g', { class: 'frame-chart-bars' });

                        barSeries.forEach((s, sIdx) => {
                            s.data.forEach((val, cIdx) => {
                                const catStartX = padding.left + cIdx * catWidth + (catWidth - barGroupWidth) / 2;
                                const barX = catStartX + sIdx * (singleBarWidth + 3);
                                const barH = Math.max(((val - min) / valRange) * plotH, 2);
                                const barY = padding.top + plotH - barH;

                                const rect = createSVG('rect', {
                                    class: 'frame-chart-bar' + (this.options.animated !== false ? ' frame-chart-animated' : ''),
                                    x: barX.toFixed(2),
                                    y: barY.toFixed(2),
                                    width: singleBarWidth.toFixed(2),
                                    height: barH.toFixed(2),
                                    fill: s.color,
                                    'data-series': s.name,
                                    'data-val': val,
                                    'data-label': this.labels[cIdx] || '',
                                    'data-color': s.color
                                });
                                rect.addEventListener('mouseenter', (e) => this._showElementTooltip(e, rect, this.labels[cIdx] || '', s.name, val, s.color));
                                rect.addEventListener('mouseleave', () => this.tooltip.classList.remove('active'));
                                barsG.appendChild(rect);
                            });
                        });
                        this.svg.appendChild(barsG);
                    }

                    // 2. Render Line & Area series
                    this.computedPoints = [];
                    lineSeries.forEach((s, sIdx) => {
                        const pts = s.data.map((val, i) => {
                            const x = padding.left + i * catWidth + catWidth / 2;
                            const y = padding.top + plotH - ((val - min) / valRange) * plotH;
                            return { x, y, val, label: this.labels[i] || '', seriesName: s.name, color: s.color };
                        });
                        this.computedPoints.push({ series: s, points: pts });

                        // Area fill if series has fill or s.type === 'area'
                        if (s.fill || s.type === 'area') {
                            const gradId = `${this.id}-mixed-grad-${sIdx}`;
                            const grad = createSVG('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
                            grad.appendChild(createSVG('stop', { offset: '0%', 'stop-color': s.color, 'stop-opacity': '0.3' }));
                            grad.appendChild(createSVG('stop', { offset: '100%', 'stop-color': s.color, 'stop-opacity': '0.01' }));
                            this.defs.appendChild(grad);

                            const linePath = this.options.curved ? getSplinePath(pts) : getLinearPath(pts);
                            const baselineY = padding.top + plotH;
                            const areaD = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${baselineY} L ${pts[0].x.toFixed(2)} ${baselineY} Z`;
                            this.svg.appendChild(createSVG('path', {
                                class: 'frame-chart-area' + (this.options.animated !== false ? ' frame-chart-animated' : ''),
                                d: areaD,
                                fill: `url(#${gradId})`
                            }));
                        }

                        // Line stroke
                        const lineD = this.options.curved ? getSplinePath(pts) : getLinearPath(pts);
                        const line = createSVG('path', {
                            class: 'frame-chart-line' + (this.options.animated !== false ? ' frame-chart-animated' : ''),
                            d: lineD,
                            stroke: s.color,
                            'stroke-width': this.options.strokeWidth || 3
                        });
                        if (this.options.animated !== false) {
                            try {
                                const len = line.getTotalLength ? line.getTotalLength() : 1200;
                                line.style.strokeDasharray = len;
                                line.style.strokeDashoffset = len;
                            } catch (_) {
                                line.style.strokeDasharray = 1200;
                                line.style.strokeDashoffset = 1200;
                            }
                        }
                        this.svg.appendChild(line);

                        // Dots
                        if (this.options.showDots !== false) {
                            const dotsG = createSVG('g', { class: 'frame-chart-dots' });
                            pts.forEach(p => {
                                const dot = createSVG('circle', {
                                    class: 'frame-chart-dot',
                                    cx: p.x.toFixed(2),
                                    cy: p.y.toFixed(2),
                                    r: 4.5,
                                    fill: s.color
                                });
                                dotsG.appendChild(dot);
                            });
                            this.svg.appendChild(dotsG);
                        }
                    });

                    // Crosshair guideline for hover
                    if (lineSeries.length > 0 || barSeries.length > 0) {
                        this.crosshair = createSVG('line', {
                            class: 'frame-chart-crosshair',
                            y1: padding.top,
                            y2: padding.top + plotH,
                            style: 'opacity: 0'
                        });
                        this.svg.appendChild(this.crosshair);
                    }

                    this.plotArea = { padding, plotW, plotH, stepX: catWidth, numPoints: numCategories, min, max, isMixed: true };
                }

                _renderHorizontalBar(width, height) {
                    const visibleSeries = this.series.filter(s => !s.hidden);
                    const s = visibleSeries[0] || { data: [], color: DEFAULT_PALETTE[0] };
                    const vals = Array.isArray(s.data) ? s.data : (visibleSeries.map(item => item.value || 0));
                    const maxVal = Math.max(...vals, 10);
                    const numBars = Math.max(vals.length, 1);

                    // Dynamic left padding based on longest label text
                    const labelLengths = vals.map((v, i) => {
                        const lbl = this.labels[i] || (visibleSeries[i] ? visibleSeries[i].name : `Item ${i + 1}`);
                        return (lbl || '').length;
                    });
                    const maxLabelLen = Math.max(...labelLengths, 1);
                    const dynamicLeft = Math.min(Math.max(Math.ceil(maxLabelLen * 7.2) + 20, 85), 140);

                    // Dynamic right padding based on longest formatted value string
                    const sampleVals = vals.map(v => formatVal(v, this.options.format));
                    const maxValLen = Math.max(...sampleVals.map(str => (str || '').length), 1);
                    const dynamicRight = Math.min(Math.max(Math.ceil(maxValLen * 7.5) + 24, 55), 105);

                    const padding = { top: 20, right: dynamicRight, bottom: 25, left: dynamicLeft };
                    const plotW = width - padding.left - padding.right;
                    const plotH = height - padding.top - padding.bottom;
                    if (plotW <= 0 || plotH <= 0) return;

                    const rowH = plotH / numBars;
                    const barH = Math.min(rowH * 0.58, 24);

                    const barsG = createSVG('g', { class: 'frame-chart-bars' });
                    const labelsG = createSVG('g', { class: 'frame-chart-labels' });

                    vals.forEach((v, i) => {
                        const y = padding.top + i * rowH + (rowH - barH) / 2;
                        const barW = Math.max((v / maxVal) * plotW, 3);
                        const labelText = this.labels[i] || (visibleSeries[i] ? visibleSeries[i].name : `Item ${i + 1}`);
                        const color = (visibleSeries[i] && visibleSeries[i].color) || s.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];

                        // Y label
                        const text = createSVG('text', {
                            x: padding.left - 10,
                            y: y + barH / 2 + 4,
                            'text-anchor': 'end'
                        });
                        text.textContent = labelText;
                        labelsG.appendChild(text);

                        // Background track
                        barsG.appendChild(createSVG('rect', {
                            x: padding.left,
                            y: y.toFixed(2),
                            width: plotW.toFixed(2),
                            height: barH.toFixed(2),
                            fill: 'var(--bg-subtle)',
                            rx: 4,
                            ry: 4
                        }));

                        // Value bar
                        const rect = createSVG('rect', {
                            class: 'frame-chart-bar' + (this.options.animated !== false ? ' frame-chart-horiz-animated' : ''),
                            x: padding.left,
                            y: y.toFixed(2),
                            width: barW.toFixed(2),
                            height: barH.toFixed(2),
                            fill: color,
                            rx: 4,
                            ry: 4
                        });
                        rect.addEventListener('mouseenter', (e) => this._showElementTooltip(e, rect, labelText, '', v, color));
                        rect.addEventListener('mouseleave', () => this.tooltip.classList.remove('active'));
                        barsG.appendChild(rect);

                        // Value label at end
                        const valText = createSVG('text', {
                            x: padding.left + barW + 8,
                            y: y + barH / 2 + 4,
                            'text-anchor': 'start',
                            'font-weight': '600',
                            fill: 'var(--text-main)'
                        });
                        valText.textContent = formatVal(v, this.options.format);
                        labelsG.appendChild(valText);
                    });

                    this.svg.appendChild(barsG);
                    this.svg.appendChild(labelsG);
                }

                _renderDonutPie(width, height) {
                    const cx = width / 2;
                    const cy = height / 2;
                    const r = Math.min(width, height) / 2 - 20;
                    if (r <= 10) return;
                    const innerR = this.type === 'donut' ? r * (this.options.donutCutout || 0.65) : 0;

                    const visibleSeries = this.series.filter(s => !s.hidden);
                    const values = visibleSeries.map(s => s.value !== undefined ? s.value : (Array.isArray(s.data) ? s.data[0] || 0 : 0));
                    const total = values.reduce((acc, v) => acc + (Number(v) || 0), 0) || 1;

                    let currentAngle = 0;
                    const slicesG = createSVG('g', { class: 'frame-chart-slices' });

                    visibleSeries.forEach((s, i) => {
                        const val = values[i];
                        const sliceAngle = (val / total) * 360;
                        const startA = currentAngle;
                        const endA = currentAngle + sliceAngle;
                        currentAngle = endA;

                        const d = describeDonutSlice(cx, cy, innerR, r, startA, endA);
                        const slice = createSVG('path', {
                            class: 'frame-chart-slice',
                            d,
                            fill: s.color
                        });
                        const pct = ((val / total) * 100).toFixed(1) + '%';
                        slice.addEventListener('mouseenter', (e) => {
                            this._showElementTooltip(e, slice, s.name, pct, val, s.color);
                        });
                        slice.addEventListener('mouseleave', () => this.tooltip.classList.remove('active'));
                        slicesG.appendChild(slice);
                    });
                    this.svg.appendChild(slicesG);

                    // Donut center text
                    if (this.type === 'donut') {
                        const centerVal = this.options.centerText !== undefined ? this.options.centerText : formatVal(total, this.options.format);
                        const centerLbl = this.options.centerSubtext !== undefined ? this.options.centerSubtext : 'Total';

                        const valText = createSVG('text', {
                            class: 'frame-chart-center-val',
                            x: cx,
                            y: cy - 4
                        });
                        valText.textContent = centerVal;
                        this.svg.appendChild(valText);

                        if (centerLbl) {
                            const lblText = createSVG('text', {
                                class: 'frame-chart-center-lbl',
                                x: cx,
                                y: cy + 18
                            });
                            lblText.textContent = centerLbl;
                            this.svg.appendChild(lblText);
                        }
                    }
                }

                _renderGauge(width, height) {
                    const cx = width / 2;
                    const cy = height * 0.70;
                    const r = Math.min(width * 0.38, height * 0.48);
                    const strokeWidth = r * 0.22;
                    const startAngle = -100;
                    const endAngle = 100;
                    const totalAngle = endAngle - startAngle;

                    const val = (this.series[0] && (this.series[0].value !== undefined ? this.series[0].value : (this.series[0].data && this.series[0].data[0]))) || 75;
                    const maxVal = this.options.max || 100;
                    const minVal = this.options.min || 0;
                    const pct = Math.min(Math.max((val - minVal) / (maxVal - minVal), 0), 1);
                    const valAngle = startAngle + totalAngle * pct;
                    const color = (this.series[0] && this.series[0].color) || DEFAULT_PALETTE[0];

                    // Track arc
                    const bgArc = createSVG('path', {
                        class: 'frame-chart-gauge-bg',
                        d: describeArc(cx, cy, r, startAngle, endAngle),
                        'stroke-width': strokeWidth
                    });
                    this.svg.appendChild(bgArc);

                    // Progress arc
                    if (pct > 0) {
                        const valArc = createSVG('path', {
                            class: 'frame-chart-gauge-val',
                            d: describeArc(cx, cy, r, startAngle, valAngle),
                            stroke: color,
                            'stroke-width': strokeWidth
                        });
                        this.svg.appendChild(valArc);
                    }

                    // Value and Subtitle text
                    const centerVal = this.options.centerText || (formatVal(val, this.options.format));
                    const valText = createSVG('text', {
                        class: 'frame-chart-center-val',
                        x: cx,
                        y: cy - 10
                    });
                    valText.textContent = centerVal;
                    this.svg.appendChild(valText);

                    const subText = createSVG('text', {
                        class: 'frame-chart-center-lbl',
                        x: cx,
                        y: cy + 15
                    });
                    subText.textContent = this.options.centerSubtext || `${Math.round(pct * 100)}% da Meta`;
                    this.svg.appendChild(subText);

                    // Min & Max indicator labels
                    const labelsG = createSVG('g', { class: 'frame-chart-labels' });
                    const minRad = (startAngle - 90) * Math.PI / 180;
                    const maxRad = (endAngle - 90) * Math.PI / 180;
                    const minLabel = createSVG('text', { x: cx + (r + strokeWidth * 0.8) * Math.cos(minRad), y: cy + (r + strokeWidth * 0.8) * Math.sin(minRad) + 12, 'text-anchor': 'middle' });
                    minLabel.textContent = minVal;
                    const maxLabel = createSVG('text', { x: cx + (r + strokeWidth * 0.8) * Math.cos(maxRad), y: cy + (r + strokeWidth * 0.8) * Math.sin(maxRad) + 12, 'text-anchor': 'middle' });
                    maxLabel.textContent = maxVal;
                    labelsG.appendChild(minLabel);
                    labelsG.appendChild(maxLabel);
                    this.svg.appendChild(labelsG);
                }

                _renderRadar(width, height) {
                    const cx = width / 2;
                    const cy = height / 2;
                    const r = Math.min(width, height) / 2 - 46;
                    const categories = this.labels;
                    const numAxes = categories.length;
                    if (numAxes < 3 || r <= 10) return;

                    const levels = 4;
                    const maxVal = this.options.max || 100;

                    // Concentric polygon web
                    for (let l = 1; l <= levels; l++) {
                        const levelR = (r / levels) * l;
                        const polyPts = [];
                        for (let i = 0; i < numAxes; i++) {
                            const angle = ((i / numAxes) * 360 - 90) * Math.PI / 180;
                            polyPts.push(`${(cx + levelR * Math.cos(angle)).toFixed(2)},${(cy + levelR * Math.sin(angle)).toFixed(2)}`);
                        }
                        this.svg.appendChild(createSVG('polygon', {
                            class: 'frame-chart-radar-grid',
                            points: polyPts.join(' ')
                        }));
                    }

                    // Axis lines & labels
                    const labelsG = createSVG('g', { class: 'frame-chart-labels' });
                    for (let i = 0; i < numAxes; i++) {
                        const angle = ((i / numAxes) * 360 - 90) * Math.PI / 180;
                        const axX = cx + r * Math.cos(angle);
                        const axY = cy + r * Math.sin(angle);
                        this.svg.appendChild(createSVG('line', {
                            class: 'frame-chart-radar-axis',
                            x1: cx,
                            y1: cy,
                            x2: axX,
                            y2: axY
                        }));

                        const lblX = cx + (r + 18) * Math.cos(angle);
                        const lblY = cy + (r + 18) * Math.sin(angle);
                        const text = createSVG('text', {
                            x: lblX,
                            y: lblY + 4,
                            'text-anchor': Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : (Math.cos(angle) > 0 ? 'start' : 'end')
                        });
                        text.textContent = categories[i];
                        labelsG.appendChild(text);
                    }
                    this.svg.appendChild(labelsG);

                    // Series polygons
                    const visibleSeries = this.series.filter(s => !s.hidden && s.data);
                    visibleSeries.forEach(s => {
                        const pts = [];
                        s.data.forEach((val, i) => {
                            const pct = Math.min(Math.max(val / maxVal, 0), 1);
                            const curR = r * pct;
                            const angle = ((i / numAxes) * 360 - 90) * Math.PI / 180;
                            pts.push({ x: cx + curR * Math.cos(angle), y: cy + curR * Math.sin(angle), val, label: categories[i] });
                        });

                        const polyStr = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
                        const poly = createSVG('polygon', {
                            class: 'frame-chart-radar-poly',
                            points: polyStr,
                            fill: s.color,
                            stroke: s.color
                        });
                        this.svg.appendChild(poly);

                        // Dots
                        pts.forEach(p => {
                            const dot = createSVG('circle', {
                                class: 'frame-chart-dot',
                                cx: p.x.toFixed(2),
                                cy: p.y.toFixed(2),
                                r: 3.5,
                                fill: s.color
                            });
                            dot.addEventListener('mouseenter', (e) => this._showElementTooltip(e, dot, p.label, s.name, p.val, s.color));
                            dot.addEventListener('mouseleave', () => this.tooltip.classList.remove('active'));
                            this.svg.appendChild(dot);
                        });
                    });
                }

                _renderSparkline(width, height) {
                    const padding = { top: 4, right: 4, bottom: 4, left: 4 };
                    const plotW = width - padding.left - padding.right;
                    const plotH = height - padding.top - padding.bottom;
                    const s = this.series[0] || { data: [5, 12, 8, 16, 10, 20], color: DEFAULT_PALETTE[0] };
                    const rawData = Array.isArray(s.data) ? s.data : [10, 20];
                    const min = Math.min(...rawData);
                    const max = Math.max(...rawData);
                    const range = max - min || 1;
                    const stepX = plotW / (rawData.length - 1);

                    const pts = rawData.map((val, i) => ({
                        x: padding.left + i * stepX,
                        y: padding.top + plotH - ((val - min) / range) * plotH
                    }));

                    // Area fill gradient
                    const gradId = `${this.id}-spark-grad`;
                    const grad = createSVG('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
                    grad.appendChild(createSVG('stop', { offset: '0%', 'stop-color': s.color, 'stop-opacity': '0.35' }));
                    grad.appendChild(createSVG('stop', { offset: '100%', 'stop-color': s.color, 'stop-opacity': '0.0' }));
                    this.defs.appendChild(grad);

                    const lineD = getSplinePath(pts);
                    const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(2)} ${height} L ${pts[0].x.toFixed(2)} ${height} Z`;

                    this.svg.appendChild(createSVG('path', { d: areaD, fill: `url(#${gradId})` }));
                    this.svg.appendChild(createSVG('path', { d: lineD, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linecap': 'round' }));
                }

                _renderLegend() {
                    if (!this.legendWrap || !this.options.legend || this.type === 'sparkline') return;
                    this.legendWrap.innerHTML = '';

                    const isDonutOrPie = this.type === 'donut' || this.type === 'pie';
                    const items = isDonutOrPie
                        ? this.series.map(s => ({ name: s.name, color: s.color, hidden: s.hidden, ref: s }))
                        : this.series.map(s => ({ name: s.name, color: s.color, hidden: s.hidden, ref: s }));

                    items.forEach((item, idx) => {
                        const el = document.createElement('div');
                        el.className = 'frame-chart-legend-item' + (item.hidden ? ' dimmed' : '');
                        el.innerHTML = `<span class="frame-chart-legend-color" style="background-color: ${item.color}"></span><span>${item.name}</span>`;

                        el.addEventListener('click', () => {
                            this.toggleSeries(idx);
                        });
                        this.legendWrap.appendChild(el);
                    });
                }

                _handleMouseMove(e) {
                    if (!this.plotArea || !this.options.tooltip) return;
                    const rect = this.svgWrap.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const { padding, plotW, numPoints, isMixed, stepX: mixedStepX } = this.plotArea;
                    const stepX = isMixed ? mixedStepX : (numPoints > 1 ? plotW / (numPoints - 1) : plotW / 2);
                    let idx;
                    let curX;
                    if (isMixed) {
                        idx = Math.floor((mouseX - padding.left) / stepX);
                        idx = Math.max(0, Math.min(idx, numPoints - 1));
                        curX = padding.left + idx * stepX + stepX / 2;
                    } else {
                        idx = Math.round((mouseX - padding.left) / stepX);
                        idx = Math.max(0, Math.min(idx, numPoints - 1));
                        curX = padding.left + (numPoints > 1 ? idx * stepX : plotW / 2);
                    }

                    // Move crosshair
                    if (this.crosshair) {
                        this.crosshair.setAttribute('x1', curX.toFixed(2));
                        this.crosshair.setAttribute('x2', curX.toFixed(2));
                        this.crosshair.style.opacity = '1';
                    }

                    // Build tooltip
                    const headerText = this.labels[idx] || `Item ${idx + 1}`;
                    let itemsHtml = '';
                    let topY = Infinity;

                    this.series.forEach(s => {
                        if (!s.hidden && s.data && s.data[idx] !== undefined) {
                            itemsHtml += `
                                <div class="frame-chart-tooltip-item">
                                    <div class="frame-chart-tooltip-left">
                                        <span class="frame-chart-tooltip-dot" style="background-color: ${s.color}"></span>
                                        <span class="frame-chart-tooltip-label">${s.name}</span>
                                    </div>
                                    <span class="frame-chart-tooltip-value">${formatVal(s.data[idx], this.options.format)}</span>
                                </div>
                            `;
                        }
                    });

                    if (this.computedPoints) {
                        this.computedPoints.forEach(cp => {
                            const p = cp.points[idx];
                            if (p && !cp.series.hidden) {
                                topY = Math.min(topY, p.y);
                            }
                        });
                    }

                    this.tooltip.innerHTML = `
                        <div class="frame-chart-tooltip-header">${headerText}</div>
                        <div class="frame-chart-tooltip-items">${itemsHtml}</div>
                    `;

                    this.tooltip.style.left = curX + 'px';
                    this.tooltip.style.top = (isFinite(topY) ? Math.max(topY, 30) : 60) + 'px';
                    this.tooltip.classList.add('active');
                }

                _handleMouseLeave() {
                    if (this.crosshair) this.crosshair.style.opacity = '0';
                    if (this.tooltip) this.tooltip.classList.remove('active');
                }

                _showElementTooltip(e, targetEl, title, subtitle, val, color) {
                    if (!this.options.tooltip) return;
                    const rect = this.svgWrap.getBoundingClientRect();
                    const elRect = targetEl.getBoundingClientRect();
                    const posX = elRect.left - rect.left + elRect.width / 2;
                    const posY = elRect.top - rect.top;

                    this.tooltip.innerHTML = `
                        <div class="frame-chart-tooltip-header">${title}</div>
                        <div class="frame-chart-tooltip-items">
                            <div class="frame-chart-tooltip-item">
                                <div class="frame-chart-tooltip-left">
                                    <span class="frame-chart-tooltip-dot" style="background-color: ${color}"></span>
                                    <span class="frame-chart-tooltip-label">${subtitle || title}</span>
                                </div>
                                <span class="frame-chart-tooltip-value">${formatVal(val, this.options.format)}</span>
                            </div>
                        </div>
                    `;
                    this.tooltip.style.left = posX + 'px';
                    this.tooltip.style.top = posY + 'px';
                    this.tooltip.classList.add('active');
                }

                toggleSeries(idx) {
                    if (this.series[idx]) {
                        this.series[idx].hidden = !this.series[idx].hidden;
                        this.render();
                    }
                }

                update(newData, newOptions = {}) {
                    if (newData) {
                        this.data = newData;
                        this._normalizeData();
                    }
                    if (newOptions) {
                        this.options = Object.assign(this.options, newOptions);
                    }
                    this.render();
                }

                destroy() {
                    if (this._resizeObserver) this._resizeObserver.disconnect();
                    if (this.svgWrap) {
                        this.svgWrap.removeEventListener('mousemove', this._onMouseMove);
                        this.svgWrap.removeEventListener('mouseleave', this._onMouseLeave);
                    }
                    this.container.innerHTML = '';
                }

                exportSVG() {
                    if (!this.svg) return '';
                    return new XMLSerializer().serializeToString(this.svg);
                }

                exportPNG(filename = 'chart.png') {
                    const svgString = this.exportSVG();
                    if (!svgString) return;
                    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                    const URL = window.URL || window.webkitURL || window;
                    const blobURL = URL.createObjectURL(svgBlob);
                    const image = new Image();
                    image.onload = () => {
                        const canvas = document.createElement('canvas');
                        const scale = 2; // Retina 2x resolution
                        canvas.width = (this.svgWrap.clientWidth || 600) * scale;
                        canvas.height = (this.options.height || 280) * scale;
                        const ctx = canvas.getContext('2d');
                        ctx.scale(scale, scale);
                        ctx.drawImage(image, 0, 0);
                        const png = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.download = filename;
                        a.href = png;
                        a.click();
                        URL.revokeObjectURL(blobURL);
                    };
                    image.src = blobURL;
                }

                static autoInit() {
                    const elements = document.querySelectorAll('[data-chart]');
                    elements.forEach(el => {
                        if (el._frameChart) return;
                        const type = el.getAttribute('data-chart') || 'line';
                        let data = { labels: [], series: [] };
                        let options = {};
                        try {
                            const rawData = el.getAttribute('data-chart-data');
                            if (rawData) data = JSON.parse(rawData);
                            const rawOptions = el.getAttribute('data-chart-options');
                            if (rawOptions) options = JSON.parse(rawOptions);
                        } catch (err) {
                            console.error('FramePER.Chart autoInit erro ao fazer parse do JSON:', err);
                        }
                        el._frameChart = new FramePERChart(el, { type, data, options });
                    });
                }
            }

            return FramePERChart;
        })(),

        // --- 11. Command Palette (Spotlight / Cmd+K / Ctrl+K) ---
        CommandPalette: (function() {
            let dialog = null;
            let input = null;
            let body = null;
            let items = [];
            let selectedIndex = 0;
            let isOpen = false;

            const DEFAULT_COMMANDS = [
                {
                    group: 'Navegação Rápida',
                    id: 'nav-home',
                    title: 'Início & Destaques',
                    desc: 'Página inicial do Frame PER',
                    icon: 'icon-star',
                    action: () => { window.location.href = 'index.html'; }
                },
                {
                    group: 'Navegação Rápida',
                    id: 'nav-charts',
                    title: 'Gráficos SVG',
                    desc: 'Playground interativo com 9+ modelos vetoriais',
                    icon: 'icon-activity',
                    badge: 'Novo',
                    action: () => { window.location.href = 'charts.html'; }
                },
                {
                    group: 'Navegação Rápida',
                    id: 'nav-dashboard',
                    title: 'Admin Dashboard (Visão Geral)',
                    desc: 'Métricas, vendas e atividades do sistema',
                    icon: 'icon-home',
                    action: () => { window.location.href = 'dashboard.html'; }
                },
                {
                    group: 'Navegação Rápida',
                    id: 'nav-users',
                    title: 'Usuários & Permissões',
                    desc: 'Tabela com ordenação, busca e cadastro',
                    icon: 'icon-user',
                    action: () => { window.location.href = 'users.html'; }
                },
                {
                    group: 'Navegação Rápida',
                    id: 'nav-messages',
                    title: 'Mensagens & Inbox',
                    desc: 'Chat ao vivo e conversas de suporte',
                    icon: 'icon-envelope',
                    action: () => { window.location.href = 'messages.html'; }
                },
                {
                    group: 'Navegação Rápida',
                    id: 'nav-reports',
                    title: 'Agendamentos & Relatórios',
                    desc: 'Histórico de operações e métricas',
                    icon: 'icon-calendar',
                    action: () => { window.location.href = 'reports.html'; }
                },
                {
                    group: 'Navegação Rápida',
                    id: 'nav-settings',
                    title: 'Configurações do Sistema',
                    desc: 'Perfil, segurança, notificações e 2FA',
                    icon: 'icon-settings',
                    action: () => { window.location.href = 'settings.html'; }
                },
                {
                    group: 'Aplicações Temáticas',
                    id: 'nav-beauty',
                    title: 'Aura Beauty & Nails',
                    desc: 'Studio de beleza, catálogo e agendamento online',
                    icon: 'icon-sparkles',
                    action: () => { window.location.href = 'beauty.html'; }
                },
                {
                    group: 'Aplicações Temáticas',
                    id: 'nav-social',
                    title: 'Rede Social Demo',
                    desc: 'Feed, stories, trending hashtags e comentários',
                    icon: 'icon-heart',
                    action: () => { window.location.href = 'social.html'; }
                },
                {
                    group: 'Aplicações Temáticas',
                    id: 'nav-store',
                    title: 'Loja de Roupas & Moda',
                    desc: 'E-commerce com sacola lateral deslizante',
                    icon: 'icon-tag',
                    action: () => { window.location.href = 'store.html'; }
                },
                {
                    group: 'Aplicações Temáticas',
                    id: 'nav-delivery',
                    title: 'Gusto Delivery & Restaurante',
                    desc: 'Cardápio digital, sacola, cupons e rastreio de pedido',
                    icon: 'icon-cart',
                    action: () => { window.location.href = 'delivery.html'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-converter',
                    title: 'Conversor Universal de Dados',
                    desc: 'Converter XLSX, XLS, CSV, PDF, JSON e XML 100% client-side',
                    icon: 'icon-layers',
                    badge: 'Novo',
                    action: () => { window.location.href = 'converter.html'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-components',
                    title: 'Galeria de Componentes UI',
                    desc: 'Botões, modais, tabelas, forms, chips e skeletons',
                    icon: 'icon-settings',
                    action: () => { window.location.href = 'components.html'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-uploader',
                    title: 'File Uploader (Drag & Drop)',
                    desc: 'Upload avançado com preview, barra de progresso e validações',
                    icon: 'icon-upload',
                    action: () => { window.location.href = 'index.html#uploader-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-interactive-ui',
                    title: 'Abas, Accordions & Popovers',
                    desc: 'Slider deslizante de abas, sanfona fluida e popover inteligente',
                    icon: 'icon-settings',
                    action: () => { window.location.href = 'index.html#interativos-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-context-menu',
                    title: 'Menu de Contexto & Dropdowns',
                    desc: 'Menu de botão direito com submenus em cascata e detecção de bordas',
                    icon: 'icon-menu',
                    action: () => { window.location.href = 'index.html#context-menu-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-form-validator',
                    title: 'Validador de Formulários Reativo',
                    desc: 'Validação declarativa em tempo real com CPF, CNPJ, Luhn e mensagens animadas',
                    icon: 'icon-check',
                    action: () => { window.location.href = 'index.html#form-validator-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-activity-feed',
                    title: 'Central de Atividades & Notificações',
                    desc: 'Drawer lateral com feed em tempo real, filtros e badges de não lidas',
                    icon: 'icon-bell',
                    action: () => {
                        if (window.FramePER && window.FramePER.ActivityFeed) {
                            window.FramePER.ActivityFeed.open();
                        } else {
                            window.location.href = 'index.html#activity-feed-demo';
                        }
                    }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-split-pane',
                    title: 'Split View & Painéis Redimensionáveis',
                    desc: 'Divisores arrastáveis suavemente (drag & resize) e persistência de layout',
                    icon: 'icon-layout',
                    action: () => { window.location.href = 'index.html#split-pane-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-tree-view',
                    title: 'Tree View Interativo',
                    desc: 'Árvore hierárquica, checkboxes tri-state e filtro em tempo real',
                    icon: 'icon-folder',
                    action: () => { window.location.href = 'index.html#tree-view-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-data-grid',
                    title: 'Data Grid Dinâmico',
                    desc: 'Tabela rica com paginação client-side, ordenação e exportação CSV/JSON',
                    icon: 'icon-activity',
                    action: () => { window.location.href = 'index.html#data-grid-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-kanban',
                    title: 'Kanban Board Drag-and-Drop',
                    desc: 'Quadro interativo com arraste suave de cartões e colunas ágeis',
                    icon: 'icon-layout',
                    action: () => { window.location.href = 'index.html#kanban-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-timeline',
                    title: 'Timeline / Linha do Tempo',
                    desc: 'Histórico cronológico, tracking de etapas e status dinâmico',
                    icon: 'icon-clock',
                    action: () => { window.location.href = 'index.html#timeline-demo'; }
                },
                {
                    group: 'Componentes & Docs',
                    id: 'nav-manual',
                    title: 'Manual de API Completo',
                    desc: 'Documentação dos utilitários CSS e JS',
                    icon: 'icon-info',
                    action: () => { window.location.href = 'manual.html'; }
                },
                {
                    group: 'Ações do Sistema',
                    id: 'action-tour',
                    title: 'Iniciar Tour Guiado Interativo',
                    desc: 'Apresentação passo a passo com foco spotlight em recursos',
                    icon: 'icon-compass',
                    badge: 'Tour',
                    action: () => {
                        if (window.FramePER && window.FramePER.Tour) {
                            window.FramePER.Tour.start();
                        }
                    }
                },
                {
                    group: 'Ações do Sistema',
                    id: 'action-theme',
                    title: 'Alternar Tema Claro / Escuro',
                    desc: 'Alterna entre Dark Mode e Light Mode',
                    icon: 'icon-moon',
                    badge: 'Tema',
                    action: () => {
                        const toggle = document.querySelector('[data-theme-toggle]');
                        if (toggle) toggle.click();
                        else if (window.FramePER && window.FramePER.Theme) window.FramePER.Theme.toggle();
                    }
                }
            ];

            function createDOM() {
                if (dialog) return;
                const backdrop = document.createElement('div');
                backdrop.className = 'command-backdrop';
                backdrop.innerHTML = `
                    <div class="command-dialog" role="dialog" aria-modal="true" aria-label="Comandos Rápidos">
                        <div class="command-header">
                            <i class="icon icon-search command-search-icon"></i>
                            <input type="text" class="command-input" placeholder="Digite para buscar páginas, ações ou componentes..." autocomplete="off">
                            <button type="button" class="command-close-btn" aria-label="Fechar"><i class="icon icon-close"></i></button>
                        </div>
                        <div class="command-body"></div>
                        <div class="command-footer">
                            <div class="command-shortcuts">
                                <span class="command-shortcut"><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
                                <span class="command-shortcut"><kbd>↵</kbd> selecionar</span>
                                <span class="command-shortcut"><kbd>ESC</kbd> fechar</span>
                            </div>
                            <span>Frame PER Spotlight</span>
                        </div>
                    </div>
                `;
                document.body.appendChild(backdrop);
                dialog = backdrop;
                input = backdrop.querySelector('.command-input');
                body = backdrop.querySelector('.command-body');

                backdrop.addEventListener('click', (e) => {
                    if (e.target === backdrop) close();
                });
                backdrop.querySelector('.command-close-btn').addEventListener('click', close);

                input.addEventListener('input', (e) => {
                    renderList(e.target.value.trim());
                });

                input.addEventListener('keydown', (e) => {
                    const visibleItems = body.querySelectorAll('.command-item');
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (visibleItems.length) {
                            selectedIndex = (selectedIndex + 1) % visibleItems.length;
                            updateSelection(visibleItems);
                        }
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (visibleItems.length) {
                            selectedIndex = (selectedIndex - 1 + visibleItems.length) % visibleItems.length;
                            updateSelection(visibleItems);
                        }
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (visibleItems[selectedIndex]) {
                            visibleItems[selectedIndex].click();
                        }
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        close();
                    }
                });
            }

            function updateSelection(visibleEls) {
                visibleEls.forEach((el, i) => {
                    if (i === selectedIndex) {
                        el.classList.add('is-selected');
                        el.scrollIntoView({ block: 'nearest' });
                    } else {
                        el.classList.remove('is-selected');
                    }
                });
            }

            function renderList(query = '') {
                if (!body) return;
                body.innerHTML = '';
                const q = query.toLowerCase();
                const filtered = items.filter(it => {
                    if (!q) return true;
                    return (it.title && it.title.toLowerCase().includes(q)) ||
                           (it.desc && it.desc.toLowerCase().includes(q)) ||
                           (it.group && it.group.toLowerCase().includes(q));
                });

                if (filtered.length === 0) {
                    body.innerHTML = `
                        <div class="command-empty">
                            <div class="command-empty-icon"><i class="icon icon-search"></i></div>
                            <p>Nenhum resultado encontrado para "<strong>${escapeStr(query)}</strong>"</p>
                        </div>
                    `;
                    return;
                }

                const groups = {};
                filtered.forEach(it => {
                    const g = it.group || 'Geral';
                    if (!groups[g]) groups[g] = [];
                    groups[g].push(it);
                });

                let overallIdx = 0;
                Object.keys(groups).forEach(grpTitle => {
                    const groupWrap = document.createElement('div');
                    groupWrap.className = 'command-group';
                    const titleEl = document.createElement('div');
                    titleEl.className = 'command-group-title';
                    titleEl.textContent = grpTitle;
                    groupWrap.appendChild(titleEl);

                    groups[grpTitle].forEach(cmd => {
                        const itemIdx = overallIdx++;
                        const itemEl = document.createElement('div');
                        itemEl.className = 'command-item' + (itemIdx === selectedIndex ? ' is-selected' : '');
                        itemEl.setAttribute('tabindex', '0');
                        itemEl.innerHTML = `
                            <div class="command-item-left">
                                <span class="command-item-icon"><i class="icon ${cmd.icon || 'icon-activity'}"></i></span>
                                <div class="command-item-text">
                                    <div class="command-item-title">${cmd.title}</div>
                                    ${cmd.desc ? `<div class="command-item-desc">${cmd.desc}</div>` : ''}
                                </div>
                            </div>
                            ${cmd.badge ? `<span class="badge badge-primary badge-pill command-item-badge">${cmd.badge}</span>` : `<kbd class="command-item-badge">↵</kbd>`}
                        `;

                        itemEl.addEventListener('mouseenter', () => {
                            selectedIndex = itemIdx;
                            updateSelection(body.querySelectorAll('.command-item'));
                        });

                        itemEl.addEventListener('click', () => {
                            close();
                            if (typeof cmd.action === 'function') {
                                cmd.action();
                            }
                        });

                        groupWrap.appendChild(itemEl);
                    });
                    body.appendChild(groupWrap);
                });

                selectedIndex = 0;
                const visibleEls = body.querySelectorAll('.command-item');
                updateSelection(visibleEls);
            }

            function escapeStr(str) {
                return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
            }

            function open() {
                createDOM();
                isOpen = true;
                dialog.classList.add('open');
                selectedIndex = 0;
                input.value = '';
                renderList('');
                setTimeout(() => input.focus(), 50);
            }

            function close() {
                if (!dialog) return;
                isOpen = false;
                dialog.classList.remove('open');
            }

            function toggle() {
                if (isOpen) close();
                else open();
            }

            function register(newItems) {
                if (Array.isArray(newItems)) {
                    items.push(...newItems);
                } else if (newItems) {
                    items.push(newItems);
                }
            }

            function init(customCommands = []) {
                items = [...DEFAULT_COMMANDS, ...customCommands];
                createDOM();

                window.addEventListener('keydown', (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                        e.preventDefault();
                        toggle();
                    }
                });

                document.addEventListener('click', (e) => {
                    const trigger = e.target.closest('[data-command-palette], [data-toggle="command-palette"]');
                    if (trigger) {
                        e.preventDefault();
                        open();
                    }
                });
            }

            return {
                init,
                open,
                close,
                toggle,
                register
            };
        })(),

        // ======================================================================
        // FramePER.Datepicker: Native Pure JS/CSS Date & Range Picker
        // ======================================================================
        Datepicker: (() => {
            const MONTH_NAMES = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

            function pad(n) { return String(n).padStart(2, '0'); }

            function formatDate(d) {
                if (!d || isNaN(d.getTime())) return '';
                return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
            }

            function parseDate(str) {
                if (!str || typeof str !== 'string') return null;
                const parts = str.trim().split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        const d = new Date(year, month, day);
                        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
                            return d;
                        }
                    }
                }
                return null;
            }

            class Instance {
                constructor(input, options = {}) {
                    this.input = typeof input === 'string' ? document.querySelector(input) : input;
                    if (!this.input || this.input._frameDatepicker) return;
                    this.input._frameDatepicker = this;

                    this.isRange = options.range || this.input.getAttribute('data-datepicker') === 'range';
                    
                    const today = new Date();
                    this.viewYear = today.getFullYear();
                    this.viewMonth = today.getMonth();

                    this.selectedDate = null;
                    this.rangeStart = null;
                    this.rangeEnd = null;

                    if (this.input.value) {
                        if (this.isRange && this.input.value.includes(' - ')) {
                            const [s, e] = this.input.value.split(' - ');
                            this.rangeStart = parseDate(s);
                            this.rangeEnd = parseDate(e);
                            if (this.rangeStart) {
                                this.viewYear = this.rangeStart.getFullYear();
                                this.viewMonth = this.rangeStart.getMonth();
                            }
                        } else {
                            const parsed = parseDate(this.input.value);
                            if (parsed) {
                                this.selectedDate = parsed;
                                this.viewYear = parsed.getFullYear();
                                this.viewMonth = parsed.getMonth();
                            }
                        }
                    }

                    this._createDOM();
                    this._bindEvents();
                }

                _createDOM() {
                    this.popover = document.createElement('div');
                    this.popover.className = 'frame-datepicker-popover';
                    document.body.appendChild(this.popover);
                }

                _bindEvents() {
                    this.input.addEventListener('focus', () => this.open());
                    this.input.addEventListener('click', () => this.open());

                    document.addEventListener('click', (e) => {
                        if (!this.isOpen) return;
                        if (!this.popover.contains(e.target) && e.target !== this.input) {
                            this.close();
                        }
                    });

                    window.addEventListener('resize', () => {
                        if (this.isOpen) this._position();
                    });

                    window.addEventListener('scroll', () => {
                        if (this.isOpen) this._position();
                    }, true);

                    this.input.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape' && this.isOpen) {
                            this.close();
                        }
                    });
                }

                _position() {
                    const rect = this.input.getBoundingClientRect();
                    const popoverH = this.popover.offsetHeight || 310;
                    const popoverW = this.popover.offsetWidth || 296;
                    
                    let top = rect.bottom + window.scrollY + 6;
                    let left = rect.left + window.scrollX;

                    if (rect.bottom + popoverH + 10 > window.innerHeight && rect.top - popoverH > 0) {
                        top = rect.top + window.scrollY - popoverH - 6;
                        this.popover.classList.add('popover-top');
                    } else {
                        this.popover.classList.remove('popover-top');
                    }

                    if (left + popoverW > window.innerWidth - 10) {
                        left = window.innerWidth - popoverW - 10;
                    }
                    if (left < 10) left = 10;

                    this.popover.style.top = `${top}px`;
                    this.popover.style.left = `${left}px`;
                }

                render() {
                    const year = this.viewYear;
                    const month = this.viewMonth;

                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const prevLastDay = new Date(year, month, 0);

                    const startingDay = firstDay.getDay();
                    const totalDays = lastDay.getDate();

                    const today = new Date();
                    const isTodayYearMonth = today.getFullYear() === year && today.getMonth() === month;

                    let html = `
                        <div class="frame-datepicker-header">
                            <button type="button" class="frame-datepicker-nav-btn prev-btn" aria-label="Mês anterior">&lsaquo;</button>
                            <span class="frame-datepicker-title">${MONTH_NAMES[month]} ${year}</span>
                            <button type="button" class="frame-datepicker-nav-btn next-btn" aria-label="Próximo mês">&rsaquo;</button>
                        </div>
                        <div class="frame-datepicker-weekdays">
                            ${WEEKDAY_NAMES.map(w => `<span>${w}</span>`).join('')}
                        </div>
                        <div class="frame-datepicker-days">
                    `;

                    // Previous month trailing days
                    const prevMonthDays = prevLastDay.getDate();
                    for (let i = startingDay - 1; i >= 0; i--) {
                        const dayNum = prevMonthDays - i;
                        html += `<button type="button" class="frame-datepicker-day is-other-month" data-action="prev-month-day" data-day="${dayNum}">${dayNum}</button>`;
                    }

                    // Current month days
                    for (let day = 1; day <= totalDays; day++) {
                        const currentD = new Date(year, month, day);
                        const isToday = isTodayYearMonth && today.getDate() === day;
                        
                        let classes = ['frame-datepicker-day'];
                        if (isToday) classes.push('is-today');

                        if (this.isRange) {
                            const time = currentD.getTime();
                            const sTime = this.rangeStart ? new Date(this.rangeStart.getFullYear(), this.rangeStart.getMonth(), this.rangeStart.getDate()).getTime() : null;
                            const eTime = this.rangeEnd ? new Date(this.rangeEnd.getFullYear(), this.rangeEnd.getMonth(), this.rangeEnd.getDate()).getTime() : null;

                            if (sTime && time === sTime) {
                                classes.push('is-range-start', 'is-selected');
                            } else if (eTime && time === eTime) {
                                classes.push('is-range-end', 'is-selected');
                            } else if (sTime && eTime && time > sTime && time < eTime) {
                                classes.push('is-in-range');
                            }
                        } else if (this.selectedDate) {
                            if (this.selectedDate.getFullYear() === year &&
                                this.selectedDate.getMonth() === month &&
                                this.selectedDate.getDate() === day) {
                                classes.push('is-selected');
                            }
                        }

                        html += `<button type="button" class="${classes.join(' ')}" data-action="select-day" data-day="${day}">${day}</button>`;
                    }

                    // Next month leading days
                    const remainingCells = 42 - (startingDay + totalDays);
                    const nextDaysToShow = remainingCells < 7 ? remainingCells : remainingCells - 7;
                    for (let day = 1; day <= nextDaysToShow; day++) {
                        html += `<button type="button" class="frame-datepicker-day is-other-month" data-action="next-month-day" data-day="${day}">${day}</button>`;
                    }

                    html += `
                        </div>
                        <div class="frame-datepicker-footer">
                            <button type="button" class="btn-link" data-action="today">Hoje</button>
                            <button type="button" class="btn-link text-muted" data-action="clear">Limpar</button>
                        </div>
                    `;

                    this.popover.innerHTML = html;

                    this.popover.querySelector('.prev-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.prevMonth();
                    });
                    this.popover.querySelector('.next-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.nextMonth();
                    });

                    this.popover.querySelectorAll('[data-action="select-day"]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const day = parseInt(btn.getAttribute('data-day'), 10);
                            this.selectDay(day);
                        });
                    });

                    this.popover.querySelectorAll('[data-action="prev-month-day"]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.prevMonth();
                            const day = parseInt(btn.getAttribute('data-day'), 10);
                            this.selectDay(day);
                        });
                    });

                    this.popover.querySelectorAll('[data-action="next-month-day"]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.nextMonth();
                            const day = parseInt(btn.getAttribute('data-day'), 10);
                            this.selectDay(day);
                        });
                    });

                    const todayBtn = this.popover.querySelector('[data-action="today"]');
                    if (todayBtn) {
                        todayBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const now = new Date();
                            this.viewYear = now.getFullYear();
                            this.viewMonth = now.getMonth();
                            if (this.isRange) {
                                this.rangeStart = now;
                                this.rangeEnd = null;
                                this.input.value = formatDate(now);
                            } else {
                                this.selectedDate = now;
                                this.input.value = formatDate(now);
                                this.close();
                            }
                            this.input.dispatchEvent(new Event('input', { bubbles: true }));
                            this.input.dispatchEvent(new Event('change', { bubbles: true }));
                            this.render();
                        });
                    }

                    const clearBtn = this.popover.querySelector('[data-action="clear"]');
                    if (clearBtn) {
                        clearBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.selectedDate = null;
                            this.rangeStart = null;
                            this.rangeEnd = null;
                            this.input.value = '';
                            this.input.dispatchEvent(new Event('input', { bubbles: true }));
                            this.input.dispatchEvent(new Event('change', { bubbles: true }));
                            this.close();
                        });
                    }
                }

                selectDay(day) {
                    const picked = new Date(this.viewYear, this.viewMonth, day);

                    if (this.isRange) {
                        if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
                            this.rangeStart = picked;
                            this.rangeEnd = null;
                            this.input.value = formatDate(picked);
                        } else {
                            if (picked < this.rangeStart) {
                                this.rangeEnd = this.rangeStart;
                                this.rangeStart = picked;
                            } else {
                                this.rangeEnd = picked;
                            }
                            this.input.value = `${formatDate(this.rangeStart)} - ${formatDate(this.rangeEnd)}`;
                            this.close();
                        }
                    } else {
                        this.selectedDate = picked;
                        this.input.value = formatDate(picked);
                        this.close();
                    }

                    this.input.dispatchEvent(new Event('input', { bubbles: true }));
                    this.input.dispatchEvent(new Event('change', { bubbles: true }));
                    this.render();
                }

                prevMonth() {
                    this.viewMonth--;
                    if (this.viewMonth < 0) {
                        this.viewMonth = 11;
                        this.viewYear--;
                    }
                    this.render();
                }

                nextMonth() {
                    this.viewMonth++;
                    if (this.viewMonth > 11) {
                        this.viewMonth = 0;
                        this.viewYear++;
                    }
                    this.render();
                }

                open() {
                    this.isOpen = true;
                    this.render();
                    this.popover.classList.add('show');
                    this._position();
                }

                close() {
                    this.isOpen = false;
                    this.popover.classList.remove('show');
                }

                destroy() {
                    if (this.popover && this.popover.parentNode) {
                        this.popover.parentNode.removeChild(this.popover);
                    }
                    delete this.input._frameDatepicker;
                }
            }

            return {
                create: (input, options) => new Instance(input, options),
                init: () => {
                    document.querySelectorAll('input[data-datepicker]').forEach(input => {
                        new Instance(input);
                    });
                }
            };
        })(),

        // ======================================================================
        // FramePER.Select: Rich Searchable Single & Multi-Select with Chips
        // ======================================================================
        Select: (() => {
            class Instance {
                constructor(select, options = {}) {
                    this.select = typeof select === 'string' ? document.querySelector(select) : select;
                    if (!this.select || this.select._frameSelect) return;
                    this.select._frameSelect = this;

                    this.isMultiple = this.select.multiple || options.multiple || false;
                    this.placeholder = options.placeholder || this.select.getAttribute('data-placeholder') || 'Selecione...';
                    this.searchPlaceholder = options.searchPlaceholder || 'Pesquisar...';

                    this._buildCustomDOM();
                    this._bindEvents();
                    this.syncFromNative();
                }

                _buildCustomDOM() {
                    this.select.style.display = 'none';

                    this.wrapper = document.createElement('div');
                    this.wrapper.className = 'frame-select';
                    if (this.select.disabled) this.wrapper.classList.add('is-disabled');

                    this.trigger = document.createElement('div');
                    this.trigger.className = 'frame-select-trigger';
                    this.trigger.setAttribute('tabindex', '0');

                    this.valueContainer = document.createElement('div');
                    this.valueContainer.className = 'frame-select-value';

                    this.arrow = document.createElement('span');
                    this.arrow.className = 'frame-select-arrow';
                    this.arrow.innerHTML = '&#9662;';

                    this.trigger.appendChild(this.valueContainer);
                    this.trigger.appendChild(this.arrow);

                    this.dropdown = document.createElement('div');
                    this.dropdown.className = 'frame-select-dropdown';

                    this.searchWrap = document.createElement('div');
                    this.searchWrap.className = 'frame-select-search-wrap';
                    this.searchInput = document.createElement('input');
                    this.searchInput.type = 'text';
                    this.searchInput.className = 'frame-select-search-input';
                    this.searchInput.placeholder = this.searchPlaceholder;
                    this.searchWrap.innerHTML = '<i class="icon icon-search"></i>';
                    this.searchWrap.appendChild(this.searchInput);

                    this.optionsContainer = document.createElement('div');
                    this.optionsContainer.className = 'frame-select-options';

                    this.dropdown.appendChild(this.searchWrap);
                    this.dropdown.appendChild(this.optionsContainer);

                    this.wrapper.appendChild(this.trigger);
                    this.wrapper.appendChild(this.dropdown);

                    this.select.parentNode.insertBefore(this.wrapper, this.select.nextSibling);
                }

                _bindEvents() {
                    this.trigger.addEventListener('click', (e) => {
                        if (e.target.closest('.tag-close')) return;
                        this.toggle();
                    });

                    this.trigger.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            this.open();
                        }
                    });

                    this.searchInput.addEventListener('input', () => {
                        this._filterOptions(this.searchInput.value.trim().toLowerCase());
                    });

                    this.searchInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') {
                            this.close();
                            this.trigger.focus();
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            this._navigateOptions(1);
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            this._navigateOptions(-1);
                        } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const highlighted = this.optionsContainer.querySelector('.frame-select-option.is-highlighted');
                            if (highlighted) {
                                highlighted.click();
                            }
                        }
                    });

                    document.addEventListener('click', (e) => {
                        if (!this.isOpen) return;
                        if (!this.wrapper.contains(e.target)) {
                            this.close();
                        }
                    });

                    this.select.addEventListener('change', () => {
                        this.syncFromNative();
                    });
                }

                _renderOptions() {
                    this.optionsContainer.innerHTML = '';
                    const children = Array.from(this.select.children);
                    let hasItems = false;

                    const renderOption = (opt) => {
                        hasItems = true;
                        const optDiv = document.createElement('div');
                        optDiv.className = 'frame-select-option';
                        optDiv.setAttribute('data-value', opt.value);
                        if (opt.selected) optDiv.classList.add('is-selected');
                        if (opt.disabled) optDiv.classList.add('is-disabled');

                        const iconHtml = opt.getAttribute('data-icon') ? `<i class="icon ${opt.getAttribute('data-icon')}"></i> ` : '';
                        const badgeHtml = opt.getAttribute('data-badge') ? ` <span class="badge badge-sm badge-subtle m-l-1">${opt.getAttribute('data-badge')}</span>` : '';

                        optDiv.innerHTML = `
                            <span class="option-label">${iconHtml}${opt.textContent}${badgeHtml}</span>
                            <span class="option-check">&#10003;</span>
                        `;

                        optDiv.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (opt.disabled) return;
                            this._selectOption(opt.value);
                        });

                        this.optionsContainer.appendChild(optDiv);
                    };

                    children.forEach(child => {
                        if (child.tagName === 'OPTGROUP') {
                            const groupLabel = document.createElement('div');
                            groupLabel.className = 'frame-select-group-label';
                            groupLabel.textContent = child.label;
                            this.optionsContainer.appendChild(groupLabel);

                            Array.from(child.children).forEach(opt => renderOption(opt));
                        } else if (child.tagName === 'OPTION') {
                            renderOption(child);
                        }
                    });

                    if (!hasItems) {
                        this.optionsContainer.innerHTML = '<div class="frame-select-empty">Nenhuma opção disponível</div>';
                    }
                }

                _filterOptions(query) {
                    const options = this.optionsContainer.querySelectorAll('.frame-select-option');
                    let visibleCount = 0;

                    options.forEach(opt => {
                        const text = opt.textContent.toLowerCase();
                        if (!query || text.includes(query)) {
                            opt.style.display = 'flex';
                            visibleCount++;
                        } else {
                            opt.style.display = 'none';
                        }
                        opt.classList.remove('is-highlighted');
                    });

                    this.optionsContainer.querySelectorAll('.frame-select-group-label').forEach(lbl => {
                        let next = lbl.nextElementSibling;
                        let anyVisible = false;
                        while (next && !next.classList.contains('frame-select-group-label')) {
                            if (next.style.display !== 'none') anyVisible = true;
                            next = next.nextElementSibling;
                        }
                        lbl.style.display = anyVisible ? 'block' : 'none';
                    });

                    let emptyMsg = this.optionsContainer.querySelector('.frame-select-empty');
                    if (visibleCount === 0) {
                        if (!emptyMsg) {
                            emptyMsg = document.createElement('div');
                            emptyMsg.className = 'frame-select-empty';
                            emptyMsg.textContent = 'Nenhum resultado encontrado';
                            this.optionsContainer.appendChild(emptyMsg);
                        }
                    } else if (emptyMsg) {
                        emptyMsg.remove();
                    }
                }

                _navigateOptions(direction) {
                    const visible = Array.from(this.optionsContainer.querySelectorAll('.frame-select-option')).filter(el => el.style.display !== 'none');
                    if (visible.length === 0) return;

                    let currentIdx = visible.findIndex(el => el.classList.contains('is-highlighted'));
                    if (currentIdx !== -1) visible[currentIdx].classList.remove('is-highlighted');

                    currentIdx += direction;
                    if (currentIdx < 0) currentIdx = visible.length - 1;
                    if (currentIdx >= visible.length) currentIdx = 0;

                    visible[currentIdx].classList.add('is-highlighted');
                    visible[currentIdx].scrollIntoView({ block: 'nearest' });
                }

                _selectOption(val) {
                    if (this.isMultiple) {
                        const opt = Array.from(this.select.options).find(o => o.value === val);
                        if (opt) {
                            opt.selected = !opt.selected;
                        }
                    } else {
                        this.select.value = val;
                        this.close();
                    }

                    this.select.dispatchEvent(new Event('change', { bubbles: true }));
                    this.syncFromNative();
                    if (this.isOpen) {
                        this._renderOptions();
                    }
                }

                syncFromNative() {
                    const selectedOpts = Array.from(this.select.selectedOptions);

                    if (this.isMultiple) {
                        if (selectedOpts.length === 0) {
                            this.valueContainer.innerHTML = `<span class="frame-select-placeholder">${this.placeholder}</span>`;
                        } else {
                            this.valueContainer.innerHTML = '';
                            const tagsWrap = document.createElement('div');
                            tagsWrap.className = 'frame-select-tags';

                            selectedOpts.forEach(opt => {
                                const tag = document.createElement('span');
                                tag.className = 'frame-select-tag';
                                tag.innerHTML = `
                                    <span>${opt.textContent}</span>
                                    <span class="tag-close" data-val="${opt.value}">&times;</span>
                                `;
                                tag.querySelector('.tag-close').addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    opt.selected = false;
                                    this.select.dispatchEvent(new Event('change', { bubbles: true }));
                                    this.syncFromNative();
                                    if (this.isOpen) this._renderOptions();
                                });
                                tagsWrap.appendChild(tag);
                            });

                            this.valueContainer.appendChild(tagsWrap);
                        }
                    } else {
                        const selected = selectedOpts[0];
                        if (selected && selected.value !== '') {
                            const iconHtml = selected.getAttribute('data-icon') ? `<i class="icon ${selected.getAttribute('data-icon')}"></i> ` : '';
                            this.valueContainer.innerHTML = `<span>${iconHtml}${selected.textContent}</span>`;
                        } else {
                            this.valueContainer.innerHTML = `<span class="frame-select-placeholder">${this.placeholder}</span>`;
                        }
                    }
                }

                open() {
                    this.isOpen = true;
                    this.trigger.classList.add('is-open');
                    this.dropdown.classList.add('is-open');
                    this.searchInput.value = '';
                    this._renderOptions();
                    setTimeout(() => this.searchInput.focus(), 40);
                }

                close() {
                    this.isOpen = false;
                    this.trigger.classList.remove('is-open');
                    this.dropdown.classList.remove('is-open');
                }

                toggle() {
                    if (this.isOpen) this.close();
                    else this.open();
                }

                destroy() {
                    this.wrapper.remove();
                    this.select.style.display = '';
                    delete this.select._frameSelect;
                }
            }

            return {
                create: (select, options) => new Instance(select, options),
                init: () => {
                    document.querySelectorAll('select[data-select-search]').forEach(sel => {
                        new Instance(sel);
                    });
                }
            };
        })(),

        Upload: (() => {
            class Instance {
                constructor(container, options = {}) {
                    this.container = typeof container === 'string' ? document.querySelector(container) : container;
                    if (!this.container || this.container._frameUpload) return;
                    this.container._frameUpload = this;

                    const ds = this.container.dataset;
                    this.options = {
                        accept: ds.uploaderAccept || options.accept || '*',
                        maxSize: this._parseSize(ds.uploaderMaxSize || options.maxSize || '10MB'),
                        maxFiles: parseInt(ds.uploaderMaxFiles || options.maxFiles || 0, 10),
                        autoUpload: ds.uploaderAutoUpload !== undefined ? ds.uploaderAutoUpload === 'true' : (options.autoUpload !== undefined ? options.autoUpload : true),
                        uploadUrl: ds.uploaderUrl || options.uploadUrl || null,
                        uploadParamName: ds.uploaderParamName || options.uploadParamName || 'file',
                        multiple: ds.uploaderMultiple !== undefined ? ds.uploaderMultiple === 'true' : (options.multiple !== undefined ? options.multiple : true),
                        onFilesAdded: options.onFilesAdded || null,
                        onUploadProgress: options.onUploadProgress || null,
                        onUploadSuccess: options.onUploadSuccess || null,
                        onError: options.onError || null,
                        onFileRemoved: options.onFileRemoved || null
                    };

                    this.files = [];
                    this._initUI();
                    this._bindEvents();
                }

                _parseSize(val) {
                    if (typeof val === 'number') return val;
                    if (!val) return 10 * 1024 * 1024;
                    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
                    const match = String(val).trim().toUpperCase().match(/^([\d.]+)\s*(B|KB|MB|GB)?$/);
                    if (!match) return 10 * 1024 * 1024;
                    const num = parseFloat(match[1]);
                    const unit = match[2] || 'B';
                    return Math.round(num * (units[unit] || 1));
                }

                _formatSize(bytes) {
                    if (bytes === 0) return '0 B';
                    const k = 1024;
                    const sizes = ['B', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
                }

                _initUI() {
                    this.container.classList.add('frame-uploader');
                    
                    this.dropzone = this.container.querySelector('.upload-dropzone');
                    if (!this.dropzone) {
                        this.dropzone = document.createElement('div');
                        this.dropzone.className = 'upload-dropzone';
                        this.dropzone.setAttribute('tabindex', '0');
                        this.dropzone.setAttribute('role', 'button');
                        this.dropzone.setAttribute('aria-label', 'Clique ou arraste arquivos para enviar');

                        const acceptLabel = this.options.accept === '*' ? 'Todos os tipos suportados' : this.options.accept;
                        const maxLabel = this._formatSize(this.options.maxSize);

                        this.dropzone.innerHTML = `
                            <div class="upload-icon">
                                <i class="icon icon-upload"></i>
                            </div>
                            <h4 class="upload-title">
                                <span class="upload-action-link">Clique para escolher</span> ou arraste e solte arquivos aqui
                            </h4>
                            <p class="upload-hint">Formatos: ${acceptLabel} · Tamanho máximo: ${maxLabel} por arquivo</p>
                        `;
                        this.container.appendChild(this.dropzone);
                    }

                    this.fileInput = this.dropzone.querySelector('input[type="file"]');
                    if (!this.fileInput) {
                        this.fileInput = document.createElement('input');
                        this.fileInput.type = 'file';
                        if (this.options.multiple) this.fileInput.multiple = true;
                        if (this.options.accept && this.options.accept !== '*') {
                            this.fileInput.accept = this.options.accept;
                        }
                        this.dropzone.appendChild(this.fileInput);
                    }

                    this.listEl = this.container.querySelector('.upload-list');
                    if (!this.listEl) {
                        this.listEl = document.createElement('div');
                        this.listEl.className = 'upload-list';
                        this.container.appendChild(this.listEl);
                    }

                    this.footerEl = this.container.querySelector('.upload-footer');
                    if (!this.footerEl) {
                        this.footerEl = document.createElement('div');
                        this.footerEl.className = 'upload-footer';
                        this.footerEl.style.display = 'none';
                        this.footerEl.innerHTML = `
                            <div class="upload-stats">
                                <span class="upload-count">0 arquivos</span>
                                <span>&middot;</span>
                                <span class="upload-total-size">0 B</span>
                            </div>
                            <div class="upload-buttons">
                                <button type="button" class="btn btn-sm btn-ghost btn-clear-all">Limpar Tudo</button>
                                ${!this.options.autoUpload ? '<button type="button" class="btn btn-sm btn-primary btn-upload-all"><i class="icon icon-upload"></i> Enviar Arquivos</button>' : ''}
                            </div>
                        `;
                        this.container.appendChild(this.footerEl);
                    }

                    this.btnClearAll = this.footerEl.querySelector('.btn-clear-all');
                    this.btnUploadAll = this.footerEl.querySelector('.btn-upload-all');
                }

                _bindEvents() {
                    this.dropzone.addEventListener('click', (e) => {
                        if (e.target !== this.fileInput) {
                            this.fileInput.click();
                        }
                    });

                    this.dropzone.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.fileInput.click();
                        }
                    });

                    this.fileInput.addEventListener('change', () => {
                        if (this.fileInput.files && this.fileInput.files.length) {
                            this.addFiles(this.fileInput.files);
                            this.fileInput.value = '';
                        }
                    });

                    ['dragenter', 'dragover'].forEach(eventName => {
                        this.dropzone.addEventListener(eventName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.dropzone.classList.add('is-dragover');
                        });
                    });

                    ['dragleave', 'dragend'].forEach(eventName => {
                        this.dropzone.addEventListener(eventName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.dropzone.classList.remove('is-dragover');
                        });
                    });

                    this.dropzone.addEventListener('drop', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.dropzone.classList.remove('is-dragover');
                        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                            this.addFiles(e.dataTransfer.files);
                        }
                    });

                    if (this.btnClearAll) {
                        this.btnClearAll.addEventListener('click', () => this.clear());
                    }
                    if (this.btnUploadAll) {
                        this.btnUploadAll.addEventListener('click', () => this.uploadAll());
                    }
                }

                _validateFile(file) {
                    if (file.size > this.options.maxSize) {
                        return {
                            valid: false,
                            error: `Arquivo excede o limite de ${this._formatSize(this.options.maxSize)}.`
                        };
                    }

                    if (this.options.accept && this.options.accept !== '*') {
                        const patterns = this.options.accept.split(',').map(p => p.trim().toLowerCase());
                        const fileName = file.name.toLowerCase();
                        const fileType = (file.type || '').toLowerCase();

                        const matches = patterns.some(pattern => {
                            if (pattern.startsWith('.')) {
                                return fileName.endsWith(pattern);
                            } else if (pattern.endsWith('/*')) {
                                const baseType = pattern.replace('/*', '');
                                return fileType.startsWith(baseType + '/');
                            } else {
                                return fileType === pattern;
                            }
                        });

                        if (!matches) {
                            return {
                                valid: false,
                                error: `Tipo de arquivo não permitido (${file.name.split('.').pop()}).`
                            };
                        }
                    }

                    return { valid: true };
                }

                addFiles(fileList) {
                    const newFiles = Array.from(fileList);
                    if (!newFiles.length) return;

                    if (this.options.maxFiles > 0) {
                        const remaining = this.options.maxFiles - this.files.length;
                        if (remaining <= 0) {
                            FramePER.Notify.error('Limite de arquivos', `Você só pode enviar até ${this.options.maxFiles} arquivo(s).`);
                            return;
                        }
                        if (newFiles.length > remaining) {
                            FramePER.Notify.warning('Limite parcial', `Apenas os primeiros ${remaining} arquivos foram adicionados.`);
                            newFiles.splice(remaining);
                        }
                    }

                    const added = [];

                    newFiles.forEach(file => {
                        const validation = this._validateFile(file);
                        const fileId = 'up_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7);
                        let previewUrl = null;

                        if (file.type.startsWith('image/')) {
                            try {
                                previewUrl = URL.createObjectURL(file);
                            } catch (e) {}
                        }

                        const fileItem = {
                            id: fileId,
                            file: file,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            status: validation.valid ? 'pending' : 'error',
                            progress: 0,
                            errorMsg: validation.valid ? null : validation.error,
                            previewUrl: previewUrl,
                            xhr: null
                        };

                        this.files.push(fileItem);
                        added.push(fileItem);
                        this._renderItem(fileItem);

                        if (!validation.valid) {
                            FramePER.Notify.error('Arquivo recusado', `${file.name}: ${validation.error}`);
                            if (this.options.onError) {
                                this.options.onError(fileItem, validation.error);
                            }
                        } else if (this.options.autoUpload) {
                            this._startUpload(fileItem);
                        }
                    });

                    this._updateFooter();

                    if (this.options.onFilesAdded) {
                        this.options.onFilesAdded(added, this.files);
                    }
                }

                _renderItem(fileItem) {
                    const el = document.createElement('div');
                    el.className = `upload-item ${fileItem.status === 'error' ? 'upload-item-error' : ''}`;
                    el.setAttribute('data-file-id', fileItem.id);

                    let thumbContent = '';
                    if (fileItem.previewUrl) {
                        thumbContent = `<img src="${fileItem.previewUrl}" alt="${fileItem.name}" />`;
                    } else if (fileItem.type === 'application/pdf' || fileItem.name.endsWith('.pdf')) {
                        thumbContent = `<i class="icon icon-file-pdf text-red"></i>`;
                    } else if (fileItem.type.startsWith('image/')) {
                        thumbContent = `<i class="icon icon-image text-primary"></i>`;
                    } else {
                        thumbContent = `<i class="icon icon-file text-muted"></i>`;
                    }

                    const statusBadge = fileItem.status === 'error'
                        ? `<span class="badge badge-sm badge-red item-badge">${fileItem.errorMsg || 'Erro'}</span>`
                        : `<span class="badge badge-sm badge-subtle item-badge">${this.options.autoUpload ? '0%' : 'Pendente'}</span>`;

                    el.innerHTML = `
                        <div class="upload-item-thumb">
                            ${thumbContent}
                        </div>
                        <div class="upload-item-body">
                            <div class="upload-item-header">
                                <span class="upload-item-name" title="${fileItem.name}">${fileItem.name}</span>
                                ${statusBadge}
                            </div>
                            <div class="upload-item-meta">
                                <span>${this._formatSize(fileItem.size)}</span>
                                <span class="item-status-text">${fileItem.status === 'error' ? fileItem.errorMsg : ''}</span>
                            </div>
                            ${fileItem.status !== 'error' ? `
                                <div class="upload-item-progress-track">
                                    <div class="upload-item-progress-bar" style="width: 0%"></div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="upload-item-actions">
                            <button type="button" class="upload-item-remove-btn" title="Remover arquivo">
                                <i class="icon icon-close"></i>
                            </button>
                        </div>
                    `;

                    el.querySelector('.upload-item-remove-btn').addEventListener('click', () => {
                        this.removeFile(fileItem.id);
                    });

                    this.listEl.appendChild(el);
                    fileItem._el = el;
                }

                _startUpload(fileItem) {
                    if (fileItem.status === 'error' || fileItem.status === 'success') return;

                    fileItem.status = 'uploading';

                    if (this.options.uploadUrl) {
                        const xhr = new XMLHttpRequest();
                        fileItem.xhr = xhr;
                        const formData = new FormData();
                        formData.append(this.options.uploadParamName, fileItem.file);

                        xhr.upload.addEventListener('progress', (e) => {
                            if (e.lengthComputable) {
                                const percent = Math.round((e.loaded / e.total) * 100);
                                this._updateProgress(fileItem, percent);
                            }
                        });

                        xhr.addEventListener('load', () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                this._completeSuccess(fileItem);
                            } else {
                                this._completeError(fileItem, `Falha no upload (HTTP ${xhr.status})`);
                            }
                        });

                        xhr.addEventListener('error', () => {
                            this._completeError(fileItem, 'Erro de rede ao enviar arquivo.');
                        });

                        xhr.open('POST', this.options.uploadUrl, true);
                        xhr.send(formData);
                    } else {
                        let currentProgress = 0;
                        const stepTime = 100 + Math.floor(Math.random() * 60);
                        const interval = setInterval(() => {
                            currentProgress += Math.floor(Math.random() * 22) + 14;
                            if (currentProgress >= 100) {
                                currentProgress = 100;
                                clearInterval(interval);
                                this._updateProgress(fileItem, 100);
                                setTimeout(() => this._completeSuccess(fileItem), 80);
                            } else {
                                this._updateProgress(fileItem, currentProgress);
                            }
                        }, stepTime);
                        fileItem._simInterval = interval;
                    }
                }

                _updateProgress(fileItem, percent) {
                    fileItem.progress = percent;
                    const el = fileItem._el;
                    if (!el) return;

                    const badge = el.querySelector('.item-badge');
                    const bar = el.querySelector('.upload-item-progress-bar');

                    if (bar) bar.style.width = `${percent}%`;
                    if (badge && fileItem.status === 'uploading') {
                        badge.textContent = `${percent}%`;
                        badge.className = 'badge badge-sm badge-blue item-badge';
                    }

                    if (this.options.onUploadProgress) {
                        this.options.onUploadProgress(fileItem, percent);
                    }
                }

                _completeSuccess(fileItem) {
                    fileItem.status = 'success';
                    fileItem.progress = 100;
                    const el = fileItem._el;
                    if (el) {
                        el.classList.add('upload-item-success');
                        const badge = el.querySelector('.item-badge');
                        const bar = el.querySelector('.upload-item-progress-bar');
                        if (badge) {
                            badge.textContent = 'Concluído';
                            badge.className = 'badge badge-sm badge-green item-badge';
                        }
                        if (bar) {
                            bar.style.width = '100%';
                            bar.classList.add('bar-success');
                        }
                    }

                    if (this.options.onUploadSuccess) {
                        this.options.onUploadSuccess(fileItem);
                    }
                }

                _completeError(fileItem, message) {
                    fileItem.status = 'error';
                    fileItem.errorMsg = message;
                    const el = fileItem._el;
                    if (el) {
                        el.classList.add('upload-item-error');
                        const badge = el.querySelector('.item-badge');
                        const bar = el.querySelector('.upload-item-progress-bar');
                        const statusTxt = el.querySelector('.item-status-text');
                        if (badge) {
                            badge.textContent = 'Erro';
                            badge.className = 'badge badge-sm badge-red item-badge';
                        }
                        if (bar) bar.classList.add('bar-error');
                        if (statusTxt) statusTxt.textContent = message;
                    }

                    FramePER.Notify.error('Erro de envio', `${fileItem.name}: ${message}`);
                    if (this.options.onError) {
                        this.options.onError(fileItem, message);
                    }
                }

                uploadAll() {
                    const pendingFiles = this.files.filter(f => f.status === 'pending');
                    if (!pendingFiles.length) {
                        FramePER.Notify.info('Nenhum arquivo', 'Não há arquivos pendentes para envio.');
                        return;
                    }
                    pendingFiles.forEach(f => this._startUpload(f));
                }

                removeFile(fileId) {
                    const index = this.files.findIndex(f => f.id === fileId);
                    if (index === -1) return;

                    const fileItem = this.files[index];
                    if (fileItem.xhr) fileItem.xhr.abort();
                    if (fileItem._simInterval) clearInterval(fileItem._simInterval);
                    if (fileItem.previewUrl) {
                        try { URL.revokeObjectURL(fileItem.previewUrl); } catch (e) {}
                    }

                    if (fileItem._el) {
                        fileItem._el.style.opacity = '0';
                        fileItem._el.style.transform = 'translateY(-6px)';
                        setTimeout(() => {
                            if (fileItem._el) fileItem._el.remove();
                        }, 200);
                    }

                    this.files.splice(index, 1);
                    this._updateFooter();

                    if (this.options.onFileRemoved) {
                        this.options.onFileRemoved(fileItem, this.files);
                    }
                }

                clear() {
                    this.files.forEach(f => {
                        if (f.xhr) f.xhr.abort();
                        if (f._simInterval) clearInterval(f._simInterval);
                        if (f.previewUrl) {
                            try { URL.revokeObjectURL(f.previewUrl); } catch (e) {}
                        }
                    });
                    this.files = [];
                    this.listEl.innerHTML = '';
                    this._updateFooter();
                }

                _updateFooter() {
                    if (!this.footerEl) return;
                    if (this.files.length === 0) {
                        this.footerEl.style.display = 'none';
                        return;
                    }

                    this.footerEl.style.display = 'flex';
                    const countEl = this.footerEl.querySelector('.upload-count');
                    const sizeEl = this.footerEl.querySelector('.upload-total-size');

                    const totalBytes = this.files.reduce((acc, f) => acc + (f.size || 0), 0);
                    if (countEl) countEl.textContent = `${this.files.length} arquivo${this.files.length > 1 ? 's' : ''}`;
                    if (sizeEl) sizeEl.textContent = this._formatSize(totalBytes);
                }

                getFiles() {
                    return this.files;
                }

                destroy() {
                    this.clear();
                    delete this.container._frameUpload;
                }
            }

            return {
                create: (container, options) => new Instance(container, options),
                init: () => {
                    document.querySelectorAll('[data-uploader]').forEach(el => {
                        new Instance(el);
                    });
                }
            };
        })(),

        Tabs: (() => {
            class Instance {
                constructor(element) {
                    this.container = typeof element === 'string' ? document.querySelector(element) : element;
                    if (!this.container || this.container._frameTabs) return;
                    this.container._frameTabs = this;

                    this.isPill = this.container.classList.contains('tabs-pills');
                    this.isVertical = this.container.classList.contains('tabs-vertical');
                    this.links = Array.from(this.container.querySelectorAll('.tab-link, [data-tab-target]'));

                    this._setupAccessibility();
                    this._setupIndicator();
                    this._bindEvents();
                    this._initActiveTab();
                }

                _setupAccessibility() {
                    this.container.setAttribute('role', 'tablist');
                    if (this.isVertical) {
                        this.container.setAttribute('aria-orientation', 'vertical');
                    }
                    this.links.forEach((link, idx) => {
                        link.setAttribute('role', 'tab');
                        link.setAttribute('tabindex', link.classList.contains('active') ? '0' : '-1');
                        link.setAttribute('aria-selected', link.classList.contains('active') ? 'true' : 'false');
                        const targetId = link.getAttribute('data-target') || link.getAttribute('data-tab-target') || link.getAttribute('href');
                        if (targetId && targetId.startsWith('#')) {
                            link.setAttribute('aria-controls', targetId.substring(1));
                            const panel = document.querySelector(targetId);
                            if (panel) {
                                panel.setAttribute('role', 'tabpanel');
                                if (!panel.id) panel.id = targetId.substring(1);
                                panel.setAttribute('aria-labelledby', link.id || `tab-link-${idx}`);
                            }
                        }
                    });
                }

                _setupIndicator() {
                    if (this.isVertical) return;
                    const indicatorClass = this.isPill ? 'tab-indicator-pill' : 'tab-indicator';
                    this.indicator = this.container.querySelector('.' + indicatorClass);
                    if (!this.indicator) {
                        this.indicator = document.createElement('div');
                        this.indicator.className = indicatorClass;
                        this.container.appendChild(this.indicator);
                    }
                }

                _updateIndicator(activeLink) {
                    if (!this.indicator || !activeLink) return;
                    const containerRect = this.container.getBoundingClientRect();
                    const linkRect = activeLink.getBoundingClientRect();
                    
                    const left = linkRect.left - containerRect.left + this.container.scrollLeft;
                    const width = linkRect.width;

                    this.indicator.style.transform = `translateX(${left}px)`;
                    this.indicator.style.width = `${width}px`;
                }

                _bindEvents() {
                    this.links.forEach((link, idx) => {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.show(link);
                        });

                        link.addEventListener('keydown', (e) => {
                            let targetIdx = null;
                            if (e.key === 'ArrowRight' || (!this.isVertical && e.key === 'ArrowDown') || (this.isVertical && e.key === 'ArrowDown')) {
                                e.preventDefault();
                                targetIdx = (idx + 1) % this.links.length;
                            } else if (e.key === 'ArrowLeft' || (!this.isVertical && e.key === 'ArrowUp') || (this.isVertical && e.key === 'ArrowUp')) {
                                e.preventDefault();
                                targetIdx = (idx - 1 + this.links.length) % this.links.length;
                            } else if (e.key === 'Home') {
                                e.preventDefault();
                                targetIdx = 0;
                            } else if (e.key === 'End') {
                                e.preventDefault();
                                targetIdx = this.links.length - 1;
                            }

                            if (targetIdx !== null) {
                                const targetLink = this.links[targetIdx];
                                targetLink.focus();
                                this.show(targetLink);
                            }
                        });
                    });

                    window.addEventListener('resize', () => {
                        const activeLink = this.container.querySelector('.tab-link.active, [data-tab-target].active');
                        if (activeLink) this._updateIndicator(activeLink);
                    });
                }

                _initActiveTab() {
                    let activeLink = this.container.querySelector('.tab-link.active, [data-tab-target].active');
                    if (!activeLink && this.links.length) {
                        activeLink = this.links[0];
                    }
                    if (activeLink) {
                        this.show(activeLink, false);
                    }
                }

                show(linkOrTarget, triggerEvent = true) {
                    let targetLink = null;
                    if (typeof linkOrTarget === 'string') {
                        targetLink = this.links.find(l => {
                            const t = l.getAttribute('data-target') || l.getAttribute('data-tab-target') || l.getAttribute('href');
                            return t === linkOrTarget || l.id === linkOrTarget;
                        });
                    } else {
                        targetLink = linkOrTarget;
                    }
                    if (!targetLink) return;

                    this.links.forEach(l => {
                        l.classList.remove('active');
                        l.setAttribute('tabindex', '-1');
                        l.setAttribute('aria-selected', 'false');
                    });

                    targetLink.classList.add('active');
                    targetLink.setAttribute('tabindex', '0');
                    targetLink.setAttribute('aria-selected', 'true');

                    this._updateIndicator(targetLink);

                    const targetId = targetLink.getAttribute('data-target') || targetLink.getAttribute('data-tab-target') || targetLink.getAttribute('href');
                    if (targetId && targetId.startsWith('#')) {
                        const targetPanel = document.querySelector(targetId);
                        if (targetPanel) {
                            const parent = targetPanel.parentElement;
                            if (parent) {
                                parent.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
                            }
                            targetPanel.classList.add('active');
                        }
                    }

                    if (triggerEvent) {
                        const ev = new CustomEvent('frameper:tabchange', { detail: { target: targetId, link: targetLink } });
                        this.container.dispatchEvent(ev);
                    }
                }
            }

            return {
                create: (el) => new Instance(el),
                show: (targetId) => {
                    const link = document.querySelector(`[data-target="${targetId}"], [data-tab-target="${targetId}"], [href="${targetId}"]`);
                    if (link) {
                        const tabsEl = link.closest('.tabs, .tabs-pills, .tabs-vertical, [data-tabs]');
                        if (tabsEl && tabsEl._frameTabs) {
                            tabsEl._frameTabs.show(link);
                        } else {
                            link.click();
                        }
                    }
                },
                init: () => {
                    document.querySelectorAll('.tabs, .tabs-pills, .tabs-vertical, [data-tabs]').forEach(el => {
                        new Instance(el);
                    });
                }
            };
        })(),

        Accordion: (() => {
            class Instance {
                constructor(container, options = {}) {
                    this.container = typeof container === 'string' ? document.querySelector(container) : container;
                    if (!this.container || this.container._frameAccordion) return;
                    this.container._frameAccordion = this;

                    this.multiple = this.container.classList.contains('accordion-always-open') ||
                                    this.container.dataset.accordionMultiple === 'true' ||
                                    options.multiple === true;

                    this._bindItems();
                }

                _bindItems() {
                    const headers = Array.from(this.container.querySelectorAll('.accordion-header'));
                    headers.forEach((header, idx) => {
                        const body = header.nextElementSibling;
                        if (!body || !body.classList.contains('accordion-body')) return;

                        header.setAttribute('role', 'button');
                        header.setAttribute('tabindex', '0');
                        header.setAttribute('aria-expanded', header.classList.contains('active') ? 'true' : 'false');
                        
                        if (!header.id) header.id = `acc-header-${Math.random().toString(36).substr(2, 6)}`;
                        if (!body.id) body.id = `acc-body-${Math.random().toString(36).substr(2, 6)}`;
                        header.setAttribute('aria-controls', body.id);
                        body.setAttribute('role', 'region');
                        body.setAttribute('aria-labelledby', header.id);

                        if (header.classList.contains('active')) {
                            body.style.height = 'auto';
                        } else {
                            body.style.height = '0px';
                        }

                        header.addEventListener('click', () => this.toggle(header));

                        header.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                this.toggle(header);
                            } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const next = headers[(idx + 1) % headers.length];
                                if (next) next.focus();
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const prev = headers[(idx - 1 + headers.length) % headers.length];
                                if (prev) prev.focus();
                            } else if (e.key === 'Home') {
                                e.preventDefault();
                                headers[0].focus();
                            } else if (e.key === 'End') {
                                e.preventDefault();
                                headers[headers.length - 1].focus();
                            }
                        });
                    });
                }

                open(headerOrIndex) {
                    const header = this._resolveHeader(headerOrIndex);
                    if (!header) return;
                    const body = header.nextElementSibling;
                    if (!body || header.classList.contains('active')) return;

                    if (!this.multiple) {
                        const activeHeaders = this.container.querySelectorAll('.accordion-header.active');
                        activeHeaders.forEach(h => {
                            if (h !== header) this.close(h);
                        });
                    }

                    header.classList.add('active');
                    header.setAttribute('aria-expanded', 'true');
                    body.classList.add('active');

                    body.style.height = '0px';
                    body.offsetHeight;
                    const scrollHeight = body.scrollHeight;
                    body.style.height = scrollHeight + 'px';

                    const onEnd = (e) => {
                        if (e.target === body && header.classList.contains('active')) {
                            body.style.height = 'auto';
                            body.removeEventListener('transitionend', onEnd);
                        }
                    };
                    body.addEventListener('transitionend', onEnd);
                }

                close(headerOrIndex) {
                    const header = this._resolveHeader(headerOrIndex);
                    if (!header) return;
                    const body = header.nextElementSibling;
                    if (!body || !header.classList.contains('active')) return;

                    header.classList.remove('active');
                    header.setAttribute('aria-expanded', 'false');

                    const currentHeight = body.scrollHeight;
                    body.style.height = currentHeight + 'px';
                    body.offsetHeight;
                    body.style.height = '0px';

                    const onEnd = (e) => {
                        if (e.target === body && !header.classList.contains('active')) {
                            body.classList.remove('active');
                            body.removeEventListener('transitionend', onEnd);
                        }
                    };
                    body.addEventListener('transitionend', onEnd);
                }

                toggle(headerOrIndex) {
                    const header = this._resolveHeader(headerOrIndex);
                    if (!header) return;
                    if (header.classList.contains('active')) {
                        this.close(header);
                    } else {
                        this.open(header);
                    }
                }

                _resolveHeader(headerOrIndex) {
                    if (typeof headerOrIndex === 'number') {
                        const headers = this.container.querySelectorAll('.accordion-header');
                        return headers[headerOrIndex] || null;
                    }
                    return headerOrIndex;
                }
            }

            return {
                create: (container, options) => new Instance(container, options),
                init: () => {
                    document.querySelectorAll('.accordion, [data-accordion]').forEach(el => {
                        new Instance(el);
                    });
                }
            };
        })(),

        Popover: (() => {
            class Instance {
                constructor(trigger, options = {}) {
                    this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
                    if (!this.trigger || this.trigger._framePopover) return;
                    this.trigger._framePopover = this;

                    const ds = this.trigger.dataset;
                    this.options = {
                        title: ds.popoverTitle || options.title || '',
                        content: ds.popoverContent || options.content || '',
                        target: ds.popoverTarget || options.target || null,
                        placement: ds.popoverPlacement || options.placement || 'top',
                        trigger: ds.popoverTrigger || options.trigger || 'click',
                        dismissible: ds.popoverDismissible !== 'false' && options.dismissible !== false
                    };

                    this.popoverEl = null;
                    this.isOpen = false;
                    this._bindTrigger();
                }

                _createPopover() {
                    if (this.popoverEl) return;
                    this.popoverEl = document.createElement('div');
                    this.popoverEl.className = `popover popover-${this.options.placement}`;
                    this.popoverEl.setAttribute('role', 'tooltip');

                    let bodyHtml = this.options.content;
                    if (this.options.target) {
                        const targetNode = document.querySelector(this.options.target);
                        if (targetNode) bodyHtml = targetNode.innerHTML;
                    }

                    const closeBtnHtml = this.options.dismissible 
                        ? `<button type="button" class="popover-close-btn" aria-label="Fechar">&times;</button>` 
                        : '';

                    const headerHtml = this.options.title 
                        ? `<div class="popover-header"><span>${this.options.title}</span>${closeBtnHtml}</div>` 
                        : (this.options.dismissible ? `<div class="p-2 d-flex justify-content-end">${closeBtnHtml}</div>` : '');

                    this.popoverEl.innerHTML = `
                        <div class="popover-arrow"></div>
                        ${headerHtml}
                        <div class="popover-body">${bodyHtml}</div>
                    `;

                    document.body.appendChild(this.popoverEl);

                    const closeBtn = this.popoverEl.querySelector('.popover-close-btn');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.hide();
                        });
                    }
                }

                _bindTrigger() {
                    if (this.options.trigger === 'hover') {
                        this.trigger.addEventListener('mouseenter', () => this.show());
                        this.trigger.addEventListener('mouseleave', () => {
                            setTimeout(() => {
                                if (!this.popoverEl || !this.popoverEl.matches(':hover')) {
                                    this.hide();
                                }
                            }, 100);
                        });
                    } else {
                        this.trigger.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.toggle();
                        });
                    }
                }

                show() {
                    if (this.isOpen) return;
                    this._createPopover();

                    document.querySelectorAll('.popover.show').forEach(p => {
                        if (p !== this.popoverEl && p._instance) p._instance.hide();
                    });

                    this.isOpen = true;
                    this.popoverEl._instance = this;
                    this.popoverEl.classList.add('show');
                    this.updatePosition();
                }

                hide() {
                    if (!this.isOpen || !this.popoverEl) return;
                    this.isOpen = false;
                    this.popoverEl.classList.remove('show');
                }

                toggle() {
                    if (this.isOpen) this.hide();
                    else this.show();
                }

                updatePosition() {
                    if (!this.popoverEl || !this.isOpen) return;

                    const triggerRect = this.trigger.getBoundingClientRect();
                    const popoverRect = this.popoverEl.getBoundingClientRect();
                    const arrowEl = this.popoverEl.querySelector('.popover-arrow');

                    let placement = this.options.placement;
                    const spacing = 10;
                    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

                    const viewportW = window.innerWidth;
                    const viewportH = window.innerHeight;

                    if (placement === 'top' && triggerRect.top - popoverRect.height - spacing < 0) {
                        placement = 'bottom';
                    } else if (placement === 'bottom' && triggerRect.bottom + popoverRect.height + spacing > viewportH) {
                        placement = 'top';
                    } else if (placement === 'left' && triggerRect.left - popoverRect.width - spacing < 0) {
                        placement = 'right';
                    } else if (placement === 'right' && triggerRect.right + popoverRect.width + spacing > viewportW) {
                        placement = 'left';
                    }

                    this.popoverEl.className = `popover popover-${placement} show`;

                    let top = 0;
                    let left = 0;

                    if (placement === 'top') {
                        top = triggerRect.top + scrollY - popoverRect.height - spacing;
                        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popoverRect.width / 2);
                    } else if (placement === 'bottom') {
                        top = triggerRect.bottom + scrollY + spacing;
                        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popoverRect.width / 2);
                    } else if (placement === 'left') {
                        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popoverRect.height / 2);
                        left = triggerRect.left + scrollX - popoverRect.width - spacing;
                    } else if (placement === 'right') {
                        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popoverRect.height / 2);
                        left = triggerRect.right + scrollX + spacing;
                    }

                    const minLeft = scrollX + 8;
                    const maxLeft = scrollX + viewportW - popoverRect.width - 8;
                    const clampedLeft = Math.max(minLeft, Math.min(left, maxLeft));

                    this.popoverEl.style.top = `${Math.round(top)}px`;
                    this.popoverEl.style.left = `${Math.round(clampedLeft)}px`;

                    if (arrowEl) {
                        if (placement === 'top' || placement === 'bottom') {
                            const arrowOffset = (triggerRect.left + scrollX + (triggerRect.width / 2)) - clampedLeft - 5;
                            arrowEl.style.left = `${Math.max(12, Math.min(arrowOffset, popoverRect.width - 20))}px`;
                            arrowEl.style.top = '';
                        } else {
                            const arrowOffset = (triggerRect.top + scrollY + (triggerRect.height / 2)) - top - 5;
                            arrowEl.style.top = `${Math.max(12, Math.min(arrowOffset, popoverRect.height - 20))}px`;
                            arrowEl.style.left = '';
                        }
                    }
                }

                destroy() {
                    this.hide();
                    if (this.popoverEl) {
                        this.popoverEl.remove();
                        this.popoverEl = null;
                    }
                    delete this.trigger._framePopover;
                }
            }

            document.addEventListener('click', (e) => {
                document.querySelectorAll('.popover.show').forEach(p => {
                    const inst = p._instance;
                    if (inst && !p.contains(e.target) && !inst.trigger.contains(e.target)) {
                        inst.hide();
                    }
                });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.popover.show').forEach(p => {
                        if (p._instance) p._instance.hide();
                    });
                }
            });

            window.addEventListener('scroll', () => {
                document.querySelectorAll('.popover.show').forEach(p => {
                    if (p._instance) p._instance.updatePosition();
                });
            }, { passive: true });

            return {
                create: (trigger, options) => new Instance(trigger, options),
                init: () => {
                    document.querySelectorAll('[data-popover]').forEach(el => {
                        new Instance(el);
                    });
                }
            };
        })(),

        ContextMenu: (() => {
            let activeMenu = null;
            let activeTarget = null;
            let activeOptions = null;
            let focusedItem = null;

            function hide() {
                if (!activeMenu) return;
                activeMenu.classList.remove('show');
                activeMenu.querySelectorAll('.show-submenu').forEach(el => el.classList.remove('show-submenu'));
                activeMenu.querySelectorAll('.is-focused').forEach(el => el.classList.remove('is-focused'));
                focusedItem = null;
                if (activeOptions && typeof activeOptions.onClose === 'function') {
                    activeOptions.onClose(activeMenu, activeTarget);
                }
                activeMenu = null;
                activeTarget = null;
                activeOptions = null;
            }

            function positionSubmenu(item) {
                const submenu = item.querySelector('.context-submenu');
                if (!submenu) return;
                const itemRect = item.getBoundingClientRect();
                const pad = 10;

                const wasHidden = submenu.style.display === 'none' || getComputedStyle(submenu).visibility === 'hidden';
                if (wasHidden) {
                    submenu.style.visibility = 'hidden';
                    submenu.style.display = 'block';
                }
                const subRect = submenu.getBoundingClientRect();
                if (wasHidden) {
                    submenu.style.visibility = '';
                    submenu.style.display = '';
                }

                if (itemRect.right + (subRect.width || 190) > window.innerWidth - pad) {
                    submenu.classList.add('submenu-left');
                } else {
                    submenu.classList.remove('submenu-left');
                }

                const subHeight = subRect.height || 150;
                if (itemRect.top + subHeight > window.innerHeight - pad) {
                    const overflowY = (itemRect.top + subHeight) - (window.innerHeight - pad);
                    submenu.style.top = `-${Math.max(6, overflowY)}px`;
                } else {
                    submenu.style.top = '-0.375rem';
                }
            }

            function show(x, y, menuElementOrSelector, target = null, options = {}) {
                hide();

                const menu = typeof menuElementOrSelector === 'string'
                    ? document.querySelector(menuElementOrSelector)
                    : menuElementOrSelector;

                if (!menu) return;

                activeMenu = menu;
                activeTarget = target;
                activeOptions = options;

                if (menu.parentElement !== document.body) {
                    document.body.appendChild(menu);
                }

                menu.classList.add('show');

                const pad = 10;
                const menuRect = menu.getBoundingClientRect();
                let posX = x;
                let posY = y;

                if (posX + menuRect.width > window.innerWidth - pad) {
                    posX = Math.max(pad, window.innerWidth - menuRect.width - pad);
                }
                if (posY + menuRect.height > window.innerHeight - pad) {
                    posY = Math.max(pad, window.innerHeight - menuRect.height - pad);
                }

                menu.style.left = `${posX}px`;
                menu.style.top = `${posY}px`;

                menu.querySelectorAll('.context-menu-item.has-submenu').forEach(item => {
                    item.onmouseenter = () => {
                        positionSubmenu(item);
                        item.classList.add('show-submenu');
                    };
                    item.onmouseleave = () => {
                        item.classList.remove('show-submenu');
                    };
                });

                if (options && typeof options.onOpen === 'function') {
                    options.onOpen(menu, target);
                }
            }

            function createMenuFromItems(items) {
                const menu = document.createElement('div');
                menu.className = 'context-menu';
                menu.setAttribute('role', 'menu');

                function buildList(container, list) {
                    list.forEach(itemData => {
                        if (itemData.header) {
                            const header = document.createElement('div');
                            header.className = 'context-menu-header';
                            header.textContent = itemData.header;
                            container.appendChild(header);
                            return;
                        }
                        if (itemData.divider) {
                            const div = document.createElement('div');
                            div.className = 'context-menu-divider';
                            container.appendChild(div);
                            return;
                        }

                        const item = document.createElement('button');
                        item.className = 'context-menu-item';
                        item.setAttribute('role', 'menuitem');
                        if (itemData.action) item.dataset.action = itemData.action;
                        if (itemData.danger) item.classList.add('text-danger');
                        if (itemData.disabled) {
                            item.classList.add('is-disabled');
                            item.disabled = true;
                        }

                        let inner = '';
                        if (itemData.icon) {
                            inner += `<span class="context-menu-icon">${itemData.icon}</span>`;
                        }
                        inner += `<span class="context-menu-label">${itemData.label || ''}</span>`;
                        if (itemData.shortcut) {
                            inner += `<kbd class="context-menu-shortcut">${itemData.shortcut}</kbd>`;
                        }

                        if (itemData.submenu && Array.isArray(itemData.submenu)) {
                            item.classList.add('has-submenu');
                            inner += `<span class="context-menu-arrow">›</span>`;
                            const sub = document.createElement('div');
                            sub.className = 'context-submenu';
                            sub.setAttribute('role', 'menu');
                            buildList(sub, itemData.submenu);
                            item.innerHTML = inner;
                            item.appendChild(sub);
                        } else {
                            item.innerHTML = inner;
                        }

                        container.appendChild(item);
                    });
                }

                buildList(menu, items);
                document.body.appendChild(menu);
                return menu;
            }

            function attach(target, menuElementOrSelector, options = {}) {
                const targetEls = typeof target === 'string'
                    ? document.querySelectorAll(target)
                    : (target instanceof NodeList ? target : [target]);

                targetEls.forEach(el => {
                    if (!el) return;
                    el.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        show(e.clientX, e.clientY, menuElementOrSelector, el, options);
                    });
                });
            }

            function init() {
                document.addEventListener('contextmenu', (e) => {
                    const trigger = e.target.closest('[data-context-menu]');
                    if (trigger) {
                        e.preventDefault();
                        const menuSelector = trigger.dataset.contextMenu;
                        if (menuSelector) {
                            show(e.clientX, e.clientY, menuSelector, trigger);
                        }
                    }
                });

                document.addEventListener('click', (e) => {
                    if (!activeMenu) return;

                    const item = e.target.closest('.context-menu-item');
                    if (item && !item.classList.contains('has-submenu') && !item.classList.contains('is-disabled') && !item.disabled) {
                        const action = item.dataset.action || item.querySelector('.context-menu-label')?.textContent.trim() || item.textContent.trim();
                        
                        const detail = {
                            action,
                            item,
                            target: activeTarget
                        };

                        if (activeTarget) {
                            activeTarget.dispatchEvent(new CustomEvent('frameper:contextmenu:select', {
                                bubbles: true,
                                detail
                            }));
                        }

                        activeMenu.dispatchEvent(new CustomEvent('frameper:contextmenu:select', {
                            bubbles: true,
                            detail
                        }));

                        if (activeOptions && typeof activeOptions.onSelect === 'function') {
                            activeOptions.onSelect(action, item, activeTarget);
                        }

                        hide();
                        return;
                    }

                    if (!e.target.closest('.context-menu')) {
                        hide();
                    }
                });

                document.addEventListener('keydown', (e) => {
                    if (!activeMenu) return;

                    if (e.key === 'Escape') {
                        e.preventDefault();
                        const openSubmenu = activeMenu.querySelector('.show-submenu');
                        if (openSubmenu) {
                            openSubmenu.classList.remove('show-submenu');
                        } else {
                            hide();
                        }
                    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const currentScope = activeMenu.querySelector('.show-submenu > .context-submenu') || activeMenu;
                        const items = Array.from(currentScope.querySelectorAll(':scope > .context-menu-item:not(.is-disabled):not([disabled])'));
                        if (!items.length) return;

                        let idx = items.indexOf(focusedItem);
                        if (e.key === 'ArrowDown') {
                            idx = (idx + 1) % items.length;
                        } else {
                            idx = (idx - 1 + items.length) % items.length;
                        }

                        items.forEach(it => it.classList.remove('is-focused'));
                        focusedItem = items[idx];
                        focusedItem.classList.add('is-focused');
                        focusedItem.focus();
                    } else if (e.key === 'ArrowRight') {
                        if (focusedItem && focusedItem.classList.contains('has-submenu')) {
                            e.preventDefault();
                            positionSubmenu(focusedItem);
                            focusedItem.classList.add('show-submenu');
                            const subItem = focusedItem.querySelector('.context-submenu > .context-menu-item:not(.is-disabled):not([disabled])');
                            if (subItem) {
                                focusedItem.classList.remove('is-focused');
                                focusedItem = subItem;
                                focusedItem.classList.add('is-focused');
                                focusedItem.focus();
                            }
                        }
                    } else if (e.key === 'ArrowLeft') {
                        const openSubmenu = activeMenu.querySelector('.show-submenu');
                        if (openSubmenu) {
                            e.preventDefault();
                            const parentItem = openSubmenu;
                            parentItem.classList.remove('show-submenu');
                            if (focusedItem) focusedItem.classList.remove('is-focused');
                            focusedItem = parentItem;
                            focusedItem.classList.add('is-focused');
                            focusedItem.focus();
                        }
                    } else if (e.key === 'Enter' || e.key === ' ') {
                        if (focusedItem) {
                            e.preventDefault();
                            focusedItem.click();
                        }
                    }
                });

                window.addEventListener('scroll', () => hide(), { passive: true });
                window.addEventListener('resize', () => hide());
            }

            return {
                init,
                attach,
                show,
                hide,
                create: createMenuFromItems
            };
        })(),

        FormValidator: (() => {
            const defaultRules = {
                required: {
                    validate: (val, field) => {
                        if (field.type === 'checkbox') return field.checked;
                        if (field.type === 'radio') {
                            const name = field.name;
                            const form = field.form || document;
                            return !!form.querySelector(`input[type="radio"][name="${name}"]:checked`);
                        }
                        return val !== null && val !== undefined && String(val).trim().length > 0;
                    },
                    message: 'Este campo é obrigatório.'
                },
                email: {
                    validate: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim()),
                    message: 'Informe um endereço de e-mail válido.'
                },
                min: {
                    validate: (val, field, param) => !val || String(val).trim().length >= parseInt(param, 10),
                    message: (param) => `Mínimo de ${param} caracteres.`
                },
                max: {
                    validate: (val, field, param) => !val || String(val).trim().length <= parseInt(param, 10),
                    message: (param) => `Máximo de ${param} caracteres.`
                },
                min_val: {
                    validate: (val, field, param) => !val || parseFloat(val) >= parseFloat(param),
                    message: (param) => `O valor mínimo permitido é ${param}.`
                },
                max_val: {
                    validate: (val, field, param) => !val || parseFloat(val) <= parseFloat(param),
                    message: (param) => `O valor máximo permitido é ${param}.`
                },
                numeric: {
                    validate: (val) => !val || /^-?\d+(\.\d+)?$/.test(String(val).trim()),
                    message: 'Informe apenas números.'
                },
                digits: {
                    validate: (val) => !val || /^\d+$/.test(String(val).trim()),
                    message: 'Informe apenas dígitos numéricos.'
                },
                url: {
                    validate: (val) => !val || /^(https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(String(val).trim()),
                    message: 'Informe uma URL válida.'
                },
                phone: {
                    validate: (val) => {
                        if (!val) return true;
                        const clean = String(val).replace(/\D/g, '');
                        return clean.length >= 10 && clean.length <= 11;
                    },
                    message: 'Informe um telefone válido com DDD (10 ou 11 dígitos).'
                },
                cpf: {
                    validate: (val) => {
                        if (!val) return true;
                        const cpf = String(val).replace(/\D/g, '');
                        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
                        let sum = 0, rest;
                        for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
                        rest = (sum * 10) % 11;
                        if (rest === 10 || rest === 11) rest = 0;
                        if (rest !== parseInt(cpf.substring(9, 10), 10)) return false;
                        sum = 0;
                        for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
                        rest = (sum * 10) % 11;
                        if (rest === 10 || rest === 11) rest = 0;
                        return rest === parseInt(cpf.substring(10, 11), 10);
                    },
                    message: 'Informe um CPF válido.'
                },
                cnpj: {
                    validate: (val) => {
                        if (!val) return true;
                        const cnpj = String(val).replace(/\D/g, '');
                        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
                        let length = cnpj.length - 2;
                        let numbers = cnpj.substring(0, length);
                        let digits = cnpj.substring(length);
                        let sum = 0;
                        let pos = length - 7;
                        for (let i = length; i >= 1; i--) {
                            sum += parseInt(numbers.charAt(length - i), 10) * pos--;
                            if (pos < 2) pos = 9;
                        }
                        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
                        if (result != parseInt(digits.charAt(0), 10)) return false;
                        length = length + 1;
                        numbers = cnpj.substring(0, length);
                        sum = 0;
                        pos = length - 7;
                        for (let i = length; i >= 1; i--) {
                            sum += parseInt(numbers.charAt(length - i), 10) * pos--;
                            if (pos < 2) pos = 9;
                        }
                        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
                        return result == parseInt(digits.charAt(1), 10);
                    },
                    message: 'Informe um CNPJ válido.'
                },
                card: {
                    validate: (val) => {
                        if (!val) return true;
                        const s = String(val).replace(/\D/g, '');
                        if (s.length < 13 || s.length > 19) return false;
                        let sum = 0, shouldDouble = false;
                        for (let i = s.length - 1; i >= 0; i--) {
                            let digit = parseInt(s.charAt(i), 10);
                            if (shouldDouble) {
                                digit *= 2;
                                if (digit > 9) digit -= 9;
                            }
                            sum += digit;
                            shouldDouble = !shouldDouble;
                        }
                        return sum % 10 === 0;
                    },
                    message: 'Informe um número de cartão de crédito válido.'
                },
                match: {
                    validate: (val, field, param) => {
                        if (!val) return true;
                        const target = document.querySelector(param);
                        return target ? val === target.value : false;
                    },
                    message: 'Os campos não conferem.'
                },
                regex: {
                    validate: (val, field, param) => {
                        if (!val) return true;
                        try {
                            const re = new RegExp(param);
                            return re.test(val);
                        } catch (e) {
                            return true;
                        }
                    },
                    message: 'Formato inválido.'
                }
            };

            class Instance {
                constructor(form, options = {}) {
                    this.form = typeof form === 'string' ? document.querySelector(form) : form;
                    if (!this.form) return;
                    this.options = Object.assign({
                        realtime: true,
                        showValid: false,
                        showSummary: true,
                        onSuccess: null,
                        onError: null
                    }, options);

                    this.errors = new Map();
                    this._init();
                    this.form._frameValidator = this;
                }

                _init() {
                    const fields = this.getFields();

                    fields.forEach(field => {
                        field.addEventListener('blur', () => {
                            field._touched = true;
                            this.validateField(field);
                        });

                        field.addEventListener('input', () => {
                            if (field._touched || field.classList.contains('is-invalid')) {
                                this.validateField(field);
                            }
                        });

                        field.addEventListener('change', () => {
                            if (field.type === 'checkbox' || field.type === 'radio' || field.tagName === 'SELECT') {
                                field._touched = true;
                                this.validateField(field);
                            }
                        });
                    });

                    this.form.addEventListener('submit', (e) => {
                        const valid = this.validate();
                        if (!valid) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (typeof this.options.onError === 'function') {
                                this.options.onError(this.getErrors(), this.form, e);
                            }
                        } else {
                            if (typeof this.options.onSuccess === 'function') {
                                e.preventDefault();
                                const formData = new FormData(this.form);
                                this.options.onSuccess(formData, this.form, e);
                            }
                            this.form.dispatchEvent(new CustomEvent('frameper:form:success', {
                                bubbles: true,
                                detail: { form: this.form }
                            }));
                        }
                    });
                }

                getFields() {
                    return Array.from(this.form.querySelectorAll('[data-validate], [data-rules]')).filter(el => !el.disabled);
                }

                validateField(field) {
                    const rulesStr = field.getAttribute('data-validate') || field.getAttribute('data-rules') || '';
                    if (!rulesStr) return true;

                    const rules = rulesStr.split('|').map(r => r.trim()).filter(Boolean);
                    const val = field.value;
                    let errorMsg = null;

                    for (const ruleExpr of rules) {
                        const [ruleName, param] = ruleExpr.split(':');
                        const ruleObj = defaultRules[ruleName];

                        if (ruleObj) {
                            const isValid = ruleObj.validate(val, field, param);
                            if (!isValid) {
                                const customMsg = field.getAttribute(`data-message-${ruleName}`) ||
                                                  field.getAttribute('data-message') ||
                                                  (typeof ruleObj.message === 'function' ? ruleObj.message(param) : ruleObj.message);
                                errorMsg = customMsg;
                                break;
                            }
                        }
                    }

                    if (errorMsg) {
                        this.errors.set(field, errorMsg);
                        this._setFieldInvalid(field, errorMsg);
                        return false;
                    } else {
                        this.errors.delete(field);
                        this._setFieldValid(field);
                        return true;
                    }
                }

                _setFieldInvalid(field, message) {
                    field.classList.remove('is-valid');
                    field.classList.add('is-invalid');
                    field.setAttribute('aria-invalid', 'true');

                    let feedback = this._getFeedbackEl(field);
                    if (!feedback) {
                        feedback = document.createElement('div');
                        feedback.className = 'form-feedback form-error';
                        feedback.setAttribute('role', 'alert');
                        this._insertFeedbackEl(field, feedback);
                    } else {
                        feedback.className = 'form-feedback form-error';
                    }

                    feedback.innerHTML = `
                        <span class="feedback-icon">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </span>
                        <span>${message}</span>
                    `;
                }

                _setFieldValid(field) {
                    field.classList.remove('is-invalid');
                    field.removeAttribute('aria-invalid');

                    const feedback = this._getFeedbackEl(field);
                    if (feedback && feedback.classList.contains('form-error')) {
                        feedback.remove();
                    }

                    if (this.options.showValid || field.hasAttribute('data-show-valid')) {
                        field.classList.add('is-valid');
                    }
                }

                _getFeedbackEl(field) {
                    const parent = field.closest('.form-group') || field.parentElement;
                    return parent.querySelector(`.form-feedback[data-for="${field.id || field.name || ''}"], .form-feedback:not([data-for])`);
                }

                _insertFeedbackEl(field, feedback) {
                    if (field.id || field.name) {
                        feedback.setAttribute('data-for', field.id || field.name);
                    }
                    const parent = field.closest('.input-group') || field.closest('.input-icon') || field;
                    parent.parentNode.insertBefore(feedback, parent.nextSibling);
                }

                validate() {
                    const fields = this.getFields();
                    let allValid = true;
                    let firstInvalid = null;

                    fields.forEach(field => {
                        field._touched = true;
                        const valid = this.validateField(field);
                        if (!valid) {
                            allValid = false;
                            if (!firstInvalid) firstInvalid = field;
                        }
                    });

                    if (!allValid && firstInvalid) {
                        firstInvalid.focus();
                        firstInvalid.classList.remove('is-invalid-shake');
                        firstInvalid.offsetHeight;
                        firstInvalid.classList.add('is-invalid-shake');
                        setTimeout(() => firstInvalid.classList.remove('is-invalid-shake'), 400);

                        this._updateSummary();
                    } else {
                        const summary = this.form.querySelector('.form-error-summary');
                        if (summary) summary.classList.remove('show');
                    }

                    return allValid;
                }

                _updateSummary() {
                    if (!this.options.showSummary) return;
                    let summary = this.form.querySelector('.form-error-summary');
                    if (!summary && this.errors.size > 0) {
                        summary = document.createElement('div');
                        summary.className = 'form-error-summary show';
                        this.form.insertBefore(summary, this.form.firstChild);
                    }
                    if (!summary) return;

                    if (this.errors.size === 0) {
                        summary.classList.remove('show');
                        return;
                    }

                    let listItems = '';
                    this.errors.forEach((msg, field) => {
                        const labelText = this.form.querySelector(`label[for="${field.id}"]`)?.textContent.trim() ||
                                          field.getAttribute('placeholder') ||
                                          field.name ||
                                          'Campo';
                        listItems += `<li><a data-focus-field="${field.id || field.name}">${labelText}: ${msg}</a></li>`;
                    });

                    summary.innerHTML = `
                        <div class="summary-title">
                            <svg style="width:1.1rem;height:1.1rem" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            Por favor, corrija os erros abaixo antes de prosseguir:
                        </div>
                        <ul class="summary-list">${listItems}</ul>
                    `;
                    summary.classList.add('show');

                    summary.querySelectorAll('[data-focus-field]').forEach(link => {
                        link.onclick = (e) => {
                            e.preventDefault();
                            const targetId = link.getAttribute('data-focus-field');
                            const target = this.form.querySelector(`#${targetId}, [name="${targetId}"]`);
                            if (target) {
                                target.focus();
                                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        };
                    });
                }

                reset() {
                    this.errors.clear();
                    const fields = this.getFields();
                    fields.forEach(field => {
                        field._touched = false;
                        field.classList.remove('is-valid', 'is-invalid', 'is-invalid-shake');
                        field.removeAttribute('aria-invalid');
                        const feedback = this._getFeedbackEl(field);
                        if (feedback && feedback.classList.contains('form-error')) {
                            feedback.remove();
                        }
                    });
                    const summary = this.form.querySelector('.form-error-summary');
                    if (summary) summary.classList.remove('show');
                }

                isValid() {
                    return this.errors.size === 0;
                }

                getErrors() {
                    const result = {};
                    this.errors.forEach((msg, field) => {
                        result[field.name || field.id] = msg;
                    });
                    return result;
                }
            }

            return {
                rules: defaultRules,
                addRule: (name, validateFn, defaultMessage) => {
                    defaultRules[name] = {
                        validate: validateFn,
                        message: defaultMessage
                    };
                },
                create: (form, options) => new Instance(form, options),
                init: () => {
                    document.querySelectorAll('form[data-form-validator], form.form-validate').forEach(form => {
                        new Instance(form);
                    });
                }
            };
        })(),

        ActivityFeed: (() => {
            let drawerEl = null;
            let backdropEl = null;
            let currentFilter = 'all';
            let activities = [
                {
                    id: 'act-1',
                    title: 'Novo pedido recebido (#5042)',
                    desc: 'Cliente Marcos Santos finalizou a compra de 3 itens via Cartão de Crédito.',
                    time: 'Há 4 minutos',
                    type: 'success',
                    category: 'system',
                    unread: true,
                    action: { label: 'Ver Pedido', url: '#detalhes-5042' }
                },
                {
                    id: 'act-2',
                    title: 'Alerta de Segurança (2FA)',
                    desc: 'Novo login detectado em São Paulo, Brasil via Google Chrome / Windows 11.',
                    time: 'Há 28 minutos',
                    type: 'warning',
                    category: 'security',
                    unread: true
                },
                {
                    id: 'act-3',
                    title: 'Deploy em Produção v2.13',
                    desc: 'A compilação de assets e testes unitários foram concluídos com sucesso em 4.2s.',
                    time: 'Há 2 horas',
                    type: 'info',
                    category: 'system',
                    unread: true
                },
                {
                    id: 'act-4',
                    title: 'Backup Diário Realizado',
                    desc: 'O snapshot automático dos bancos de dados foi salvo com segurança em nuvem.',
                    time: 'Ontem às 23:45',
                    type: 'system',
                    category: 'system',
                    unread: false
                }
            ];

            function getSvgIcon(type) {
                switch (type) {
                    case 'success':
                        return `<svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`;
                    case 'warning':
                        return `<svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;
                    case 'danger':
                        return `<svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`;
                    case 'system':
                        return `<svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>`;
                    case 'info':
                    default:
                        return `<svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`;
                }
            }

            function getDrawer() {
                if (!drawerEl) {
                    drawerEl = document.querySelector('#activity-feed-drawer, .activity-drawer');
                    if (!drawerEl) {
                        drawerEl = document.createElement('div');
                        drawerEl.id = 'activity-feed-drawer';
                        drawerEl.className = 'activity-drawer';
                        document.body.appendChild(drawerEl);
                    }
                }
                return drawerEl;
            }

            function getBackdrop() {
                if (!backdropEl) {
                    backdropEl = document.querySelector('.activity-drawer-backdrop');
                    if (!backdropEl) {
                        backdropEl = document.createElement('div');
                        backdropEl.className = 'offcanvas-backdrop activity-drawer-backdrop';
                        document.body.appendChild(backdropEl);
                        backdropEl.addEventListener('click', close);
                    }
                }
                return backdropEl;
            }

            function getUnreadCount() {
                return activities.filter(a => a.unread).length;
            }

            function updateBadges() {
                const count = getUnreadCount();
                document.querySelectorAll('[data-activity-badge], .activity-count-badge').forEach(badge => {
                    badge.textContent = count;
                    if (count > 0) {
                        badge.style.display = '';
                        badge.classList.remove('has-new');
                        badge.offsetHeight;
                        badge.classList.add('has-new');
                    } else {
                        badge.textContent = '0';
                    }
                });

                document.dispatchEvent(new CustomEvent('frameper:activity:count', {
                    bubbles: true,
                    detail: { unreadCount: count, totalCount: activities.length }
                }));
            }

            function render() {
                const drawer = getDrawer();
                if (!drawer) return;

                const filtered = activities.filter(item => {
                    if (currentFilter === 'unread') return item.unread;
                    if (currentFilter === 'system') return item.category === 'system' || item.type === 'system';
                    return true;
                });

                const unreadTotal = getUnreadCount();

                let itemsHtml = '';
                if (filtered.length === 0) {
                    itemsHtml = `
                        <div class="activity-empty">
                            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                            <h4 class="empty-title">Nenhuma notificação por aqui</h4>
                            <p class="empty-desc">Você está em dia com todas as atividades e avisos do sistema.</p>
                        </div>
                    `;
                } else {
                    itemsHtml = '<div class="activity-list">' + filtered.map(item => `
                        <div class="activity-item ${item.unread ? 'unread' : ''}" data-activity-id="${item.id}">
                            ${item.unread ? '<span class="unread-dot"></span>' : ''}
                            <div class="activity-icon icon-${item.type || 'info'}">
                                ${getSvgIcon(item.type || 'info')}
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">${item.title}</div>
                                <div class="activity-desc">${item.desc}</div>
                                <div class="activity-meta">
                                    <span class="activity-time">
                                        <svg style="width:0.75rem;height:0.75rem" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                        </svg>
                                        ${item.time}
                                    </span>
                                    ${item.action ? `<button type="button" class="activity-action-btn" data-action-url="${item.action.url || '#'}">${item.action.label || 'Ver'}</button>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('') + '</div>';
                }

                drawer.innerHTML = `
                    <div class="activity-header">
                        <div class="activity-header-left">
                            <h3 class="activity-title">Central de Notificações</h3>
                            <span class="activity-count-badge">${unreadTotal}</span>
                        </div>
                        <div class="activity-header-actions">
                            <button type="button" class="btn btn-ghost btn-xs" id="btn-mark-all-read" title="Marcar todas como lidas">
                                <svg style="width:1rem;height:1rem" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                            <button type="button" class="btn btn-ghost btn-icon btn-sm" id="btn-close-activity-drawer" aria-label="Fechar painel">
                                &times;
                            </button>
                        </div>
                    </div>
                    <div class="activity-filter-bar">
                        <button type="button" class="activity-filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todas (${activities.length})</button>
                        <button type="button" class="activity-filter-btn ${currentFilter === 'unread' ? 'active' : ''}" data-filter="unread">Não Lidas (${unreadTotal})</button>
                        <button type="button" class="activity-filter-btn ${currentFilter === 'system' ? 'active' : ''}" data-filter="system">Sistema</button>
                    </div>
                    <div class="activity-body">
                        ${itemsHtml}
                    </div>
                    <div class="activity-footer">
                        <span>${activities.length} atividades no histórico</span>
                        <button type="button" class="btn btn-link btn-xs text-muted" id="btn-clear-activities" style="padding:0">Limpar tudo</button>
                    </div>
                `;

                drawer.querySelector('#btn-close-activity-drawer')?.addEventListener('click', close);
                drawer.querySelector('#btn-mark-all-read')?.addEventListener('click', markAllAsRead);
                drawer.querySelector('#btn-clear-activities')?.addEventListener('click', clear);

                drawer.querySelectorAll('.activity-filter-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        currentFilter = btn.getAttribute('data-filter');
                        render();
                    });
                });

                drawer.querySelectorAll('.activity-item').forEach(itemEl => {
                    itemEl.addEventListener('click', (e) => {
                        const id = itemEl.getAttribute('data-activity-id');
                        if (id) markAsRead(id);
                    });
                });

                updateBadges();
            }

            function open() {
                const drawer = getDrawer();
                const backdrop = getBackdrop();
                render();
                drawer.classList.add('show');
                backdrop.classList.add('show');
                document.body.style.overflow = 'hidden';
            }

            function close() {
                const drawer = getDrawer();
                const backdrop = getBackdrop();
                if (drawer) drawer.classList.remove('show');
                if (backdrop) backdrop.classList.remove('show');
                document.body.style.overflow = '';
            }

            function toggle() {
                const drawer = getDrawer();
                if (drawer && drawer.classList.contains('show')) {
                    close();
                } else {
                    open();
                }
            }

            function add(item) {
                const newItem = Object.assign({
                    id: 'act-' + Date.now(),
                    title: 'Nova notificação',
                    desc: '',
                    time: 'Agora',
                    type: 'info',
                    category: 'system',
                    unread: true
                }, item);

                activities.unshift(newItem);
                render();
                updateBadges();

                document.dispatchEvent(new CustomEvent('frameper:activity:new', {
                    bubbles: true,
                    detail: newItem
                }));

                if (window.FramePER && window.FramePER.Notify) {
                    window.FramePER.Notify.info(newItem.title, newItem.desc, 4000);
                }
            }

            function markAsRead(id) {
                const item = activities.find(a => a.id === id);
                if (item && item.unread) {
                    item.unread = false;
                    render();
                    updateBadges();
                    document.dispatchEvent(new CustomEvent('frameper:activity:read', {
                        bubbles: true,
                        detail: item
                    }));
                }
            }

            function markAllAsRead() {
                activities.forEach(a => a.unread = false);
                render();
                updateBadges();
                document.dispatchEvent(new CustomEvent('frameper:activity:all-read', {
                    bubbles: true
                }));
            }

            function clear() {
                activities = [];
                render();
                updateBadges();
            }

            function init() {
                document.addEventListener('click', (e) => {
                    const trigger = e.target.closest('[data-activity-feed-toggle], [data-activity-drawer]');
                    if (trigger) {
                        e.preventDefault();
                        toggle();
                    }
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        const drawer = getDrawer();
                        if (drawer && drawer.classList.contains('show')) {
                            close();
                        }
                    }
                });

                updateBadges();
            }

            return {
                init,
                open,
                close,
                toggle,
                add,
                markAsRead,
                markAllAsRead,
                clear,
                getUnreadCount,
                getItems: () => [...activities]
            };
        })(),

        SplitPane: (() => {
            class Instance {
                constructor(container, options = {}) {
                    this.container = typeof container === 'string' ? document.querySelector(container) : container;
                    if (!this.container) return;

                    const isVertical = this.container.classList.contains('split-vertical') || this.container.getAttribute('data-split-direction') === 'vertical';

                    this.options = Object.assign({
                        direction: isVertical ? 'vertical' : 'horizontal',
                        initialSplit: parseFloat(this.container.getAttribute('data-initial-split')) || 50,
                        rawMinSize: this.container.getAttribute('data-min-size') || options.minSize || 10,
                        rawMaxSize: this.container.getAttribute('data-max-size') || options.maxSize || 90,
                        persist: this.container.getAttribute('data-persist') || null,
                        onResize: null,
                        onCollapse: null
                    }, options);

                    this.isDragging = false;
                    this.split = this.options.initialSplit;
                    this.savedSplit = this.split;
                    this.collapsedIndex = -1;

                    this._init();
                    this.container._frameSplitPane = this;
                }

                _parseSize(val, totalPixels = 0, fallback = 10) {
                    if (val === null || val === undefined) return fallback;
                    if (typeof val === 'string') {
                        const s = val.trim();
                        if (s.endsWith('%')) {
                            const p = parseFloat(s);
                            return isNaN(p) ? fallback : p;
                        }
                        if (s.endsWith('px')) {
                            const px = parseFloat(s);
                            return totalPixels > 0 ? (px / totalPixels) * 100 : (isNaN(px) ? fallback : px);
                        }
                    }
                    const num = parseFloat(val);
                    if (isNaN(num)) return fallback;
                    // Se o número for maior que 50 e temos a dimensão em pixels do container, é valor em px
                    if (num > 50 && totalPixels > 0) {
                        return (num / totalPixels) * 100;
                    }
                    return num;
                }

                _getBounds() {
                    const rect = this.container.getBoundingClientRect();
                    const total = this.options.direction === 'vertical' ? rect.height : rect.width;
                    let min = this._parseSize(this.options.rawMinSize, total, 10);
                    let max = this._parseSize(this.options.rawMaxSize, total, 90);
                    if (min === null || isNaN(min)) min = 10;
                    if (max === null || isNaN(max)) max = 90;
                    if (min >= max) {
                        min = 10;
                        max = 90;
                    }
                    return { min: Math.max(2, min), max: Math.min(98, max) };
                }

                _init() {
                    this.panels = Array.from(this.container.querySelectorAll(':scope > .split-panel'));
                    if (this.panels.length < 2) return;

                    this.panel1 = this.panels[0];
                    this.panel2 = this.panels[1];

                    // Find or create gutter
                    this.gutter = this.container.querySelector(':scope > .split-gutter');
                    if (!this.gutter) {
                        this.gutter = document.createElement('div');
                        this.gutter.className = 'split-gutter';
                        const handle = document.createElement('div');
                        handle.className = 'gutter-handle';
                        this.gutter.appendChild(handle);
                        this.container.insertBefore(this.gutter, this.panel2);
                    }

                    // Floating ratio badge
                    this.ratioBadge = this.gutter.querySelector('.split-ratio-badge');
                    if (!this.ratioBadge) {
                        this.ratioBadge = document.createElement('div');
                        this.ratioBadge.className = 'split-ratio-badge';
                        this.ratioBadge.setAttribute('aria-hidden', 'true');
                        this.gutter.appendChild(this.ratioBadge);
                    }

                    // Acessibilidade ARIA
                    this.gutter.setAttribute('tabindex', '0');
                    this.gutter.setAttribute('role', 'separator');
                    this.gutter.setAttribute('aria-orientation', this.options.direction);
                    this.gutter.setAttribute('aria-valuenow', Math.round(this.split));
                    this.gutter.setAttribute('aria-valuemin', '5');
                    this.gutter.setAttribute('aria-valuemax', '95');
                    this.gutter.setAttribute('aria-label', 'Separador redimensionável de painéis');

                    // Teclado para acessibilidade
                    this.gutter.addEventListener('keydown', (e) => {
                        const step = e.shiftKey ? 5 : 2;
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            this.setSplit(this.split - step);
                        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            this.setSplit(this.split + step);
                        } else if (e.key === 'Home') {
                            e.preventDefault();
                            const bounds = this._getBounds();
                            this.setSplit(bounds.min);
                        } else if (e.key === 'End') {
                            e.preventDefault();
                            const bounds = this._getBounds();
                            this.setSplit(bounds.max);
                        } else if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.toggleCollapse();
                        }
                    });

                    // Restore persisted split if available
                    if (this.options.persist) {
                        try {
                            const saved = localStorage.getItem('frameper_split_' + this.options.persist);
                            if (saved !== null) {
                                const val = parseFloat(saved);
                                const bounds = this._getBounds();
                                if (!isNaN(val) && val >= bounds.min && val <= bounds.max) {
                                    this.split = val;
                                }
                            }
                        } catch (e) {}
                    }

                    this.applySplit(this.split);

                    this.gutter.addEventListener('pointerdown', (e) => this._onPointerDown(e));
                    this.gutter.addEventListener('dblclick', () => this.toggleCollapse());
                }

                _onPointerDown(e) {
                    e.preventDefault();
                    this.isDragging = true;
                    this.container.classList.add('is-resizing');
                    this.gutter.classList.add('is-dragging');
                    this.gutter.setPointerCapture(e.pointerId);

                    const bounds = this._getBounds();
                    const updateBadge = (pct) => {
                        if (this.ratioBadge) {
                            this.ratioBadge.textContent = `${Math.round(pct)}% / ${Math.round(100 - pct)}%`;
                        }
                    };
                    updateBadge(this.split);

                    const onPointerMove = (moveEvent) => {
                        if (!this.isDragging) return;
                        const rect = this.container.getBoundingClientRect();
                        let percent = 50;

                        if (this.options.direction === 'vertical') {
                            const offset = moveEvent.clientY - rect.top;
                            percent = (offset / rect.height) * 100;
                        } else {
                            const offset = moveEvent.clientX - rect.left;
                            percent = (offset / rect.width) * 100;
                        }

                        if (percent < bounds.min) percent = bounds.min;
                        if (percent > bounds.max) percent = bounds.max;

                        this.applySplit(percent);
                        updateBadge(percent);
                    };

                    const onPointerUp = (upEvent) => {
                        this.isDragging = false;
                        this.container.classList.remove('is-resizing');
                        this.gutter.classList.remove('is-dragging');
                        this.gutter.removeEventListener('pointermove', onPointerMove);
                        this.gutter.removeEventListener('pointerup', onPointerUp);
                        this.gutter.removeEventListener('pointercancel', onPointerUp);
                        try {
                            this.gutter.releasePointerCapture(upEvent.pointerId);
                        } catch (err) {}

                        if (this.options.persist) {
                            try {
                                localStorage.setItem('frameper_split_' + this.options.persist, this.split);
                            } catch (e) {}
                        }
                    };

                    this.gutter.addEventListener('pointermove', onPointerMove);
                    this.gutter.addEventListener('pointerup', onPointerUp);
                    this.gutter.addEventListener('pointercancel', onPointerUp);
                }

                applySplit(percent) {
                    this.split = Math.round(percent * 100) / 100;
                    this.collapsedIndex = -1;
                    this.panel1.classList.remove('is-collapsed');
                    this.panel2.classList.remove('is-collapsed');

                    this.panel1.style.flex = `0 0 ${this.split}%`;
                    this.panel2.style.flex = `1 1 0%`;

                    this.gutter.setAttribute('aria-valuenow', Math.round(this.split));
                    if (this.ratioBadge) {
                        this.ratioBadge.textContent = `${Math.round(this.split)}% / ${Math.round(100 - this.split)}%`;
                    }

                    if (typeof this.options.onResize === 'function') {
                        this.options.onResize(this.split, this.panel1, this.panel2);
                    }

                    this.container.dispatchEvent(new CustomEvent('frameper:split:resize', {
                        bubbles: true,
                        detail: {
                            split: this.split,
                            panel1: this.panel1,
                            panel2: this.panel2
                        }
                    }));
                }

                setSplit(percent, animated = true) {
                    const bounds = this._getBounds();
                    const clamped = Math.max(bounds.min, Math.min(bounds.max, percent));
                    if (animated) {
                        this.container.classList.add('is-animated');
                        setTimeout(() => this.container.classList.remove('is-animated'), 280);
                    }
                    this.applySplit(clamped);
                    if (this.options.persist) {
                        try {
                            localStorage.setItem('frameper_split_' + this.options.persist, clamped);
                        } catch (e) {}
                    }
                }

                getSplit() {
                    return this.split;
                }

                collapse(index = 0) {
                    this.savedSplit = this.split;
                    this.collapsedIndex = index;

                    this.container.classList.add('is-animated');
                    setTimeout(() => this.container.classList.remove('is-animated'), 280);

                    if (index === 0) {
                        this.panel1.classList.add('is-collapsed');
                        this.panel2.classList.remove('is-collapsed');
                        this.panel2.style.flex = '1 1 100%';
                    } else {
                        this.panel2.classList.add('is-collapsed');
                        this.panel1.classList.remove('is-collapsed');
                        this.panel1.style.flex = '1 1 100%';
                    }

                    if (typeof this.options.onCollapse === 'function') {
                        this.options.onCollapse(index);
                    }

                    this.container.dispatchEvent(new CustomEvent('frameper:split:collapse', {
                        bubbles: true,
                        detail: { collapsedIndex: index }
                    }));
                }

                expand() {
                    if (this.collapsedIndex !== -1) {
                        this.container.classList.add('is-animated');
                        setTimeout(() => this.container.classList.remove('is-animated'), 280);
                        this.applySplit(this.savedSplit || 50);
                    }
                }

                toggleCollapse() {
                    if (this.collapsedIndex !== -1) {
                        this.expand();
                    } else {
                        this.collapse(0);
                    }
                }

                destroy() {
                    if (this.gutter) {
                        this.gutter.remove();
                    }
                    this.panel1.style.flex = '';
                    this.panel2.style.flex = '';
                    delete this.container._frameSplitPane;
                }
            }

            return {
                create: (container, options) => new Instance(container, options),
                get: (container) => {
                    const el = typeof container === 'string' ? document.querySelector(container) : container;
                    return el ? el._frameSplitPane : null;
                },
                init: () => {
                    document.querySelectorAll('[data-split-pane], .split-pane').forEach(el => {
                        if (!el._frameSplitPane) {
                            new Instance(el);
                        }
                    });
                }
            };
        })(),

        TreeView: (() => {
            const CHEVRON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';

            class Instance {
                constructor(container, options = {}) {
                    this.container = typeof container === 'string' ? document.querySelector(container) : container;
                    if (!this.container) return;

                    this.options = Object.assign({
                        checkable: this.container.hasAttribute('data-checkable') || this.container.getAttribute('data-tree-checkable') === 'true',
                        cascadeCheck: this.container.getAttribute('data-cascade-check') !== 'false',
                        multipleSelect: this.container.getAttribute('data-multiple-select') === 'true',
                        accordion: this.container.getAttribute('data-accordion') === 'true',
                        data: null,
                        onSelect: null,
                        onCheck: null,
                        onToggle: null
                    }, options);

                    this._init();
                    this.container._frameTreeView = this;
                }

                _init() {
                    this.container.classList.add('tree-view');
                    this.container.setAttribute('role', 'tree');

                    if (Array.isArray(this.options.data) && this.options.data.length > 0) {
                        this.container.innerHTML = '';
                        this._renderNodes(this.options.data, this.container);
                    } else {
                        this._enhanceExistingDOM();
                    }

                    this._bindEvents();
                    if (this.options.checkable) {
                        this._syncAllCheckboxes();
                    }
                }

                _renderNodes(items, parentEl) {
                    const ul = document.createElement('ul');
                    ul.className = parentEl === this.container ? 'tree-root' : 'tree-children';
                    ul.setAttribute('role', 'group');

                    items.forEach((item) => {
                        const li = document.createElement('li');
                        li.className = 'tree-node';
                        li.setAttribute('role', 'treeitem');
                        const id = item.id || `node-${Math.random().toString(36).substring(2, 9)}`;
                        li.setAttribute('data-node-id', id);

                        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                        if (!hasChildren) {
                            li.classList.add('is-leaf');
                        }
                        if (item.expanded) {
                            li.classList.add('is-expanded');
                            li.setAttribute('aria-expanded', 'true');
                        } else if (hasChildren) {
                            li.setAttribute('aria-expanded', 'false');
                        }

                        const content = document.createElement('div');
                        content.className = 'tree-node-content';

                        // Toggle button
                        const toggleBtn = document.createElement('button');
                        toggleBtn.type = 'button';
                        toggleBtn.className = 'tree-toggle';
                        toggleBtn.setAttribute('aria-label', 'Alternar');
                        toggleBtn.innerHTML = CHEVRON_SVG;
                        content.appendChild(toggleBtn);

                        // Checkbox if checkable
                        if (this.options.checkable) {
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.className = 'tree-checkbox';
                            if (item.checked) cb.checked = true;
                            content.appendChild(cb);
                        }

                        // Icon
                        if (item.icon) {
                            const icon = document.createElement('span');
                            icon.className = `tree-icon ${item.icon}`;
                            content.appendChild(icon);
                        }

                        // Label
                        const label = document.createElement('span');
                        label.className = 'tree-label';
                        label.textContent = item.label || item.text || id;
                        content.appendChild(label);

                        // Badge
                        if (item.badge) {
                            const badge = document.createElement('span');
                            badge.className = 'tree-badge';
                            badge.textContent = item.badge;
                            content.appendChild(badge);
                        }

                        li.appendChild(content);

                        if (hasChildren) {
                            this._renderNodes(item.children, li);
                        }

                        ul.appendChild(li);
                    });

                    parentEl.appendChild(ul);
                }

                _enhanceExistingDOM() {
                    const allNodes = this.container.querySelectorAll('.tree-node');
                    allNodes.forEach((node) => {
                        node.setAttribute('role', 'treeitem');
                        if (!node.getAttribute('data-node-id')) {
                            node.setAttribute('data-node-id', `node-${Math.random().toString(36).substring(2, 9)}`);
                        }

                        const childrenList = node.querySelector(':scope > .tree-children, :scope > ul');
                        const hasChildren = !!childrenList;

                        if (hasChildren) {
                            childrenList.classList.add('tree-children');
                            childrenList.setAttribute('role', 'group');
                            if (node.classList.contains('is-expanded')) {
                                node.setAttribute('aria-expanded', 'true');
                            } else {
                                node.setAttribute('aria-expanded', 'false');
                            }
                        } else {
                            node.classList.add('is-leaf');
                        }

                        let content = node.querySelector(':scope > .tree-node-content');
                        if (!content) {
                            content = document.createElement('div');
                            content.className = 'tree-node-content';
                            while (node.firstChild && node.firstChild !== childrenList) {
                                content.appendChild(node.firstChild);
                            }
                            node.insertBefore(content, childrenList);
                        }

                        // Ensure toggle button exists
                        let toggle = content.querySelector(':scope > .tree-toggle');
                        if (!toggle) {
                            toggle = document.createElement('button');
                            toggle.type = 'button';
                            toggle.className = 'tree-toggle';
                            toggle.setAttribute('aria-label', 'Alternar');
                            toggle.innerHTML = CHEVRON_SVG;
                            content.insertBefore(toggle, content.firstChild);
                        }

                        // Ensure checkbox exists if checkable
                        if (this.options.checkable) {
                            let cb = content.querySelector(':scope > .tree-checkbox');
                            if (!cb) {
                                cb = document.createElement('input');
                                cb.type = 'checkbox';
                                cb.className = 'tree-checkbox';
                                if (toggle.nextSibling) {
                                    content.insertBefore(cb, toggle.nextSibling);
                                } else {
                                    content.appendChild(cb);
                                }
                            }
                        }
                    });
                }

                _bindEvents() {
                    this._clickHandler = (e) => {
                        const toggleBtn = e.target.closest('.tree-toggle');
                        if (toggleBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            const node = toggleBtn.closest('.tree-node');
                            if (node && !node.classList.contains('is-leaf')) {
                                this.toggle(node);
                            }
                            return;
                        }

                        const checkbox = e.target.closest('.tree-checkbox');
                        if (checkbox) {
                            const node = checkbox.closest('.tree-node');
                            this._handleCheckboxChange(node, checkbox.checked);
                            return;
                        }

                        const content = e.target.closest('.tree-node-content');
                        if (content && this.container.contains(content)) {
                            const node = content.closest('.tree-node');
                            if (node) {
                                this.select(node);
                            }
                        }
                    };

                    this._dblClickHandler = (e) => {
                        const content = e.target.closest('.tree-node-content');
                        if (content && this.container.contains(content)) {
                            const node = content.closest('.tree-node');
                            if (node && !node.classList.contains('is-leaf')) {
                                this.toggle(node);
                            }
                        }
                    };

                    this.container.addEventListener('click', this._clickHandler);
                    this.container.addEventListener('dblclick', this._dblClickHandler);
                }

                _handleCheckboxChange(node, isChecked) {
                    if (!node) return;
                    const checkbox = node.querySelector(':scope > .tree-node-content > .tree-checkbox');
                    if (checkbox) {
                        checkbox.checked = isChecked;
                        checkbox.indeterminate = false;
                    }

                    if (this.options.cascadeCheck) {
                        // Cascading down to all descendants
                        const descendantCheckboxes = node.querySelectorAll('.tree-children .tree-checkbox');
                        descendantCheckboxes.forEach(cb => {
                            cb.checked = isChecked;
                            cb.indeterminate = false;
                        });

                        // Cascading up to update ancestors
                        this._updateAncestors(node);
                    }

                    const nodeId = node.getAttribute('data-node-id');
                    const labelEl = node.querySelector('.tree-label');
                    const label = labelEl ? labelEl.textContent.trim() : nodeId;

                    if (typeof this.options.onCheck === 'function') {
                        this.options.onCheck({ id: nodeId, label, checked: isChecked, indeterminate: false }, node);
                    }

                    this.container.dispatchEvent(new CustomEvent('frameper:tree:check', {
                        bubbles: true,
                        detail: { id: nodeId, label, checked: isChecked, node }
                    }));
                }

                _updateAncestors(node) {
                    let parent = node.parentElement ? node.parentElement.closest('.tree-node') : null;
                    while (parent && this.container.contains(parent)) {
                        const parentCb = parent.querySelector(':scope > .tree-node-content > .tree-checkbox');
                        if (parentCb) {
                            const childNodes = Array.from(parent.querySelectorAll(':scope > .tree-children > .tree-node, :scope > ul > .tree-node'));
                            const childCheckboxes = childNodes.map(n => n.querySelector(':scope > .tree-node-content > .tree-checkbox')).filter(Boolean);

                            if (childCheckboxes.length > 0) {
                                const allChecked = childCheckboxes.every(cb => cb.checked);
                                const noneChecked = childCheckboxes.every(cb => !cb.checked && !cb.indeterminate);

                                if (allChecked) {
                                    parentCb.checked = true;
                                    parentCb.indeterminate = false;
                                } else if (noneChecked) {
                                    parentCb.checked = false;
                                    parentCb.indeterminate = false;
                                } else {
                                    parentCb.checked = false;
                                    parentCb.indeterminate = true;
                                }
                            }
                        }
                        parent = parent.parentElement ? parent.parentElement.closest('.tree-node') : null;
                    }
                }

                _syncAllCheckboxes() {
                    const leafNodes = this.container.querySelectorAll('.tree-node.is-leaf');
                    leafNodes.forEach(node => {
                        this._updateAncestors(node);
                    });
                }

                toggle(nodeOrId) {
                    const node = this._resolveNode(nodeOrId);
                    if (!node || node.classList.contains('is-leaf')) return;

                    if (node.classList.contains('is-expanded')) {
                        this.collapse(node);
                    } else {
                        this.expand(node);
                    }
                }

                expand(nodeOrId) {
                    const node = this._resolveNode(nodeOrId);
                    if (!node || node.classList.contains('is-leaf')) return;

                    if (this.options.accordion) {
                        const siblings = node.parentElement ? Array.from(node.parentElement.children) : [];
                        siblings.forEach(sib => {
                            if (sib !== node && sib.classList.contains('tree-node')) {
                                this.collapse(sib);
                            }
                        });
                    }

                    node.classList.add('is-expanded');
                    node.setAttribute('aria-expanded', 'true');

                    // Ensure all ancestor folders are also expanded so node is visible
                    let parent = node.parentElement ? node.parentElement.closest('.tree-node') : null;
                    while (parent && this.container.contains(parent)) {
                        parent.classList.add('is-expanded');
                        parent.setAttribute('aria-expanded', 'true');
                        parent = parent.parentElement ? parent.parentElement.closest('.tree-node') : null;
                    }

                    const nodeId = node.getAttribute('data-node-id');
                    if (typeof this.options.onToggle === 'function') {
                        this.options.onToggle({ id: nodeId, expanded: true }, node);
                    }
                    this.container.dispatchEvent(new CustomEvent('frameper:tree:toggle', {
                        bubbles: true,
                        detail: { id: nodeId, expanded: true, node }
                    }));
                }

                collapse(nodeOrId) {
                    const node = this._resolveNode(nodeOrId);
                    if (!node || node.classList.contains('is-leaf')) return;

                    node.classList.remove('is-expanded');
                    node.setAttribute('aria-expanded', 'false');

                    const nodeId = node.getAttribute('data-node-id');
                    if (typeof this.options.onToggle === 'function') {
                        this.options.onToggle({ id: nodeId, expanded: false }, node);
                    }
                    this.container.dispatchEvent(new CustomEvent('frameper:tree:toggle', {
                        bubbles: true,
                        detail: { id: nodeId, expanded: false, node }
                    }));
                }

                expandAll() {
                    this.container.querySelectorAll('.tree-node:not(.is-leaf)').forEach(node => {
                        node.classList.add('is-expanded');
                        node.setAttribute('aria-expanded', 'true');
                    });
                }

                collapseAll() {
                    this.container.querySelectorAll('.tree-node').forEach(node => {
                        node.classList.remove('is-expanded');
                        if (!node.classList.contains('is-leaf')) {
                            node.setAttribute('aria-expanded', 'false');
                        }
                    });
                }

                select(nodeOrId) {
                    const node = this._resolveNode(nodeOrId);
                    if (!node) return;

                    const content = node.querySelector(':scope > .tree-node-content');
                    if (!content) return;

                    if (!this.options.multipleSelect) {
                        this.container.querySelectorAll('.tree-node-content.is-selected').forEach(c => {
                            c.classList.remove('is-selected');
                        });
                    }

                    content.classList.add('is-selected');

                    const nodeId = node.getAttribute('data-node-id');
                    const labelEl = node.querySelector('.tree-label');
                    const label = labelEl ? labelEl.textContent.trim() : nodeId;

                    if (typeof this.options.onSelect === 'function') {
                        this.options.onSelect({ id: nodeId, label }, node);
                    }
                    this.container.dispatchEvent(new CustomEvent('frameper:tree:select', {
                        bubbles: true,
                        detail: { id: nodeId, label, node }
                    }));
                }

                deselect(nodeOrId) {
                    const node = this._resolveNode(nodeOrId);
                    if (!node) return;
                    const content = node.querySelector(':scope > .tree-node-content');
                    if (content) content.classList.remove('is-selected');
                }

                check(nodeOrId, checked = true) {
                    const node = this._resolveNode(nodeOrId);
                    if (!node) return;
                    this._handleCheckboxChange(node, !!checked);
                }

                uncheck(nodeOrId) {
                    this.check(nodeOrId, false);
                }

                getChecked() {
                    const result = [];
                    this.container.querySelectorAll('.tree-node').forEach(node => {
                        const cb = node.querySelector(':scope > .tree-node-content > .tree-checkbox');
                        if (cb && (cb.checked || cb.indeterminate)) {
                            const labelEl = node.querySelector('.tree-label');
                            result.push({
                                id: node.getAttribute('data-node-id'),
                                label: labelEl ? labelEl.textContent.trim() : '',
                                checked: cb.checked,
                                indeterminate: cb.indeterminate
                            });
                        }
                    });
                    return result;
                }

                getSelected() {
                    const selected = [];
                    this.container.querySelectorAll('.tree-node-content.is-selected').forEach(c => {
                        const node = c.closest('.tree-node');
                        if (node) {
                            const labelEl = node.querySelector('.tree-label');
                            selected.push({
                                id: node.getAttribute('data-node-id'),
                                label: labelEl ? labelEl.textContent.trim() : '',
                                node
                            });
                        }
                    });
                    return this.options.multipleSelect ? selected : (selected[0] || null);
                }

                filter(query) {
                    const q = (query || '').trim().toLowerCase();
                    const allNodes = Array.from(this.container.querySelectorAll('.tree-node'));

                    // Reset any existing highlight
                    this.container.querySelectorAll('.tree-label').forEach(label => {
                        if (label._originalHTML) {
                            label.innerHTML = label._originalHTML;
                            delete label._originalHTML;
                        }
                    });

                    if (!q) {
                        allNodes.forEach(node => {
                            node.classList.remove('is-filtered-out', 'is-matched');
                        });
                        return 0;
                    }

                    allNodes.forEach(node => {
                        node.classList.add('is-filtered-out');
                        node.classList.remove('is-matched');
                    });

                    let matchCount = 0;

                    allNodes.forEach(node => {
                        const labelEl = node.querySelector(':scope > .tree-node-content > .tree-label');
                        if (!labelEl) return;

                        const text = labelEl.textContent || '';
                        const idx = text.toLowerCase().indexOf(q);

                        if (idx !== -1) {
                            matchCount++;
                            node.classList.remove('is-filtered-out');
                            node.classList.add('is-matched');

                            // Highlight match
                            labelEl._originalHTML = labelEl.innerHTML;
                            const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                            labelEl.innerHTML = text.replace(regex, '<mark class="tree-highlight">$1</mark>');

                            // Reveal and expand all ancestors
                            let parent = node.parentElement ? node.parentElement.closest('.tree-node') : null;
                            while (parent && this.container.contains(parent)) {
                                parent.classList.remove('is-filtered-out');
                                parent.classList.add('is-expanded');
                                parent.setAttribute('aria-expanded', 'true');
                                parent = parent.parentElement ? parent.parentElement.closest('.tree-node') : null;
                            }
                        }
                    });

                    return matchCount;
                }

                clearFilter() {
                    return this.filter('');
                }

                _resolveNode(nodeOrId) {
                    if (!nodeOrId) return null;
                    if (typeof nodeOrId === 'string') {
                        return this.container.querySelector(`.tree-node[data-node-id="${nodeOrId}"]`) ||
                               this.container.querySelector(nodeOrId);
                    }
                    return nodeOrId;
                }

                destroy() {
                    this.container.removeEventListener('click', this._clickHandler);
                    this.container.removeEventListener('dblclick', this._dblClickHandler);
                    delete this.container._frameTreeView;
                }
            }

            return {
                create: (container, options) => new Instance(container, options),
                get: (container) => {
                    const el = typeof container === 'string' ? document.querySelector(container) : container;
                    return el ? el._frameTreeView : null;
                },
                init: () => {
                    document.querySelectorAll('[data-tree-view], .tree-view').forEach(el => {
                        if (!el._frameTreeView) {
                            new Instance(el);
                        }
                    });
                }
            };
        })(),

        DataGrid: (() => {
            const SORT_ICON_SVG = '<span class="sort-indicator"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></span>';
            const SEARCH_ICON_SVG = '<span class="search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>';

            class Instance {
                constructor(container, options = {}) {
                    this.container = typeof container === 'string' ? document.querySelector(container) : container;
                    if (!this.container) return;

                    this.options = Object.assign({
                        data: null,
                        columns: null,
                        pageSize: parseInt(this.container.getAttribute('data-page-size'), 10) || 10,
                        pageSizeOptions: [5, 10, 25, 50],
                        searchable: this.container.getAttribute('data-searchable') !== 'false',
                        selectable: this.container.getAttribute('data-selectable') !== 'false',
                        pagination: this.container.getAttribute('data-pagination') !== 'false',
                        exportable: this.container.getAttribute('data-exportable') !== 'false',
                        importable: this.container.getAttribute('data-importable') !== 'false',
                        emptyText: 'Nenhum registro encontrado',
                        onSelect: null,
                        onChange: null
                    }, options);

                    this.allData = [];
                    this.columns = [];
                    this.filteredData = [];
                    this.currentPage = 1;
                    this.pageSize = this.options.pageSize;
                    this.sortColumn = null;
                    this.sortDirection = null;
                    this.searchQuery = '';
                    this.selectedIds = new Set();

                    this._init();
                    this.container._frameDataGrid = this;
                }

                _init() {
                    let existingTable = this.container.tagName === 'TABLE' ? this.container : this.container.querySelector('table');

                    if (existingTable && (!Array.isArray(this.options.data) || this.options.data.length === 0)) {
                        this._extractFromTable(existingTable);
                    } else if (Array.isArray(this.options.data)) {
                        this.allData = this.options.data.map((item, idx) => Object.assign({ _gridId: `row-${idx + 1}` }, item));
                        if (Array.isArray(this.options.columns) && this.options.columns.length > 0) {
                            this.columns = this.options.columns;
                        } else if (this.allData.length > 0) {
                            this.columns = Object.keys(this.allData[0])
                                .filter(k => k !== '_gridId')
                                .map(k => ({ key: k, title: k.charAt(0).toUpperCase() + k.slice(1), sortable: true }));
                        }
                    }

                    this.filteredData = [...this.allData];
                    this._buildDOM();
                    this._render();
                }

                _extractFromTable(table) {
                    const ths = table.querySelectorAll('thead th');
                    this.columns = [];
                    ths.forEach((th, idx) => {
                        const key = th.getAttribute('data-key') || th.getAttribute('data-field') || `col_${idx}`;
                        const title = th.textContent.trim();
                        const sortable = th.classList.contains('sortable') || th.getAttribute('data-sortable') !== 'false';
                        this.columns.push({ key, title, sortable });
                    });

                    const trs = table.querySelectorAll('tbody tr');
                    this.allData = [];
                    trs.forEach((tr, rIdx) => {
                        const rowObj = { _gridId: tr.getAttribute('data-id') || `row-${rIdx + 1}` };
                        const tds = tr.querySelectorAll('td');
                        tds.forEach((td, cIdx) => {
                            const col = this.columns[cIdx];
                            if (col) {
                                rowObj[col.key] = td.innerHTML.trim();
                                rowObj[`_${col.key}_raw`] = td.textContent.trim();
                            }
                        });
                        this.allData.push(rowObj);
                    });

                    if (this.container.tagName === 'TABLE') {
                        const wrapper = document.createElement('div');
                        this.container.parentNode.insertBefore(wrapper, this.container);
                        this.container.remove();
                        this.container = wrapper;
                    } else {
                        table.remove();
                    }
                }

                _buildDOM() {
                    this.container.classList.add('data-grid-container');
                    this.container.innerHTML = '';

                    if (this.options.searchable || this.options.exportable || this.options.importable) {
                        this.toolbarEl = document.createElement('div');
                        this.toolbarEl.className = 'data-grid-toolbar';

                        if (this.options.searchable) {
                            const searchWrap = document.createElement('div');
                            searchWrap.className = 'data-grid-search';
                            searchWrap.innerHTML = `${SEARCH_ICON_SVG}<input type="text" class="input input-sm" placeholder="Buscar registros...">`;
                            this.searchInput = searchWrap.querySelector('input');
                            if (this.searchInput) {
                                this.searchInput.addEventListener('input', () => {
                                    this.filter(this.searchInput.value);
                                });
                            }
                            this.toolbarEl.appendChild(searchWrap);
                        }

                        if (this.options.importable) {
                            const importWrap = document.createElement('div');
                            importWrap.className = 'data-grid-import d-inline-block';

                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = '.xlsx,.xls,.csv,.json,.xml';
                            fileInput.style.display = 'none';

                            const importBtn = document.createElement('button');
                            importBtn.type = 'button';
                            importBtn.className = 'btn btn-outline btn-sm';
                            importBtn.innerHTML = '<i class="icon icon-upload m-r-1"></i> Importar';
                            importBtn.title = 'Importar arquivo (.xlsx, .xls, .csv, .json, .xml)';

                            importBtn.addEventListener('click', () => fileInput.click());
                            fileInput.addEventListener('change', () => {
                                if (fileInput.files && fileInput.files.length > 0) {
                                    this.importFile(fileInput.files[0]);
                                    fileInput.value = '';
                                }
                            });

                            importWrap.appendChild(fileInput);
                            importWrap.appendChild(importBtn);
                            this.toolbarEl.appendChild(importWrap);
                        }

                        if (this.options.exportable) {
                            const actionsWrap = document.createElement('div');
                            actionsWrap.className = 'data-grid-actions dropdown';

                            const exportBtn = document.createElement('button');
                            exportBtn.type = 'button';
                            exportBtn.className = 'btn btn-outline btn-sm dropdown-toggle';
                            exportBtn.setAttribute('data-toggle', 'dropdown');
                            exportBtn.setAttribute('aria-expanded', 'false');
                            exportBtn.innerHTML = '<i class="icon icon-download m-r-1"></i> Exportar <i class="icon icon-chevron-down m-l-1 f-s-1"></i>';

                            const menu = document.createElement('div');
                            menu.className = 'dropdown-menu dropdown-menu-end shadow-md';
                            menu.style.minWidth = '200px';

                            const formats = [
                                { key: 'xlsx', label: 'Excel (.xlsx)', icon: 'icon-file-text text-success' },
                                { key: 'pdf',  label: 'Documento PDF (.pdf)', icon: 'icon-file-text text-danger' },
                                { key: 'csv',  label: 'Planilha CSV (.csv)', icon: 'icon-activity text-primary' },
                                { key: 'json', label: 'JSON (.json)', icon: 'icon-code text-warning' },
                                { key: 'xml',  label: 'XML (.xml)', icon: 'icon-layers text-purple' }
                            ];

                            formats.forEach(f => {
                                const item = document.createElement('a');
                                item.href = '#';
                                item.className = 'dropdown-item d-flex align-items-center gap-2 py-2';
                                item.innerHTML = `<i class="icon ${f.icon}"></i> <span>${f.label}</span>`;
                                item.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    this.export(f.key, { onlySelected: false });
                                    if (menu.classList) menu.classList.remove('show');
                                });
                                menu.appendChild(item);
                            });

                            if (this.options.selectable) {
                                const divider = document.createElement('div');
                                divider.className = 'dropdown-divider';
                                menu.appendChild(divider);

                                const selItem = document.createElement('a');
                                selItem.href = '#';
                                selItem.className = 'dropdown-item d-flex align-items-center gap-2 py-2 text-primary font-medium';
                                selItem.innerHTML = '<i class="icon icon-check"></i> <span>Exportar Selecionados</span>';
                                selItem.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    this.export('xlsx', { onlySelected: true });
                                    if (menu.classList) menu.classList.remove('show');
                                });
                                menu.appendChild(selItem);
                            }

                            actionsWrap.appendChild(exportBtn);
                            actionsWrap.appendChild(menu);
                            this.toolbarEl.appendChild(actionsWrap);
                        }

                        this.container.appendChild(this.toolbarEl);
                    }

                    this.tableWrapperEl = document.createElement('div');
                    this.tableWrapperEl.className = 'data-grid-table-wrapper';

                    this.tableEl = document.createElement('table');
                    this.tableEl.className = 'data-grid-table';

                    this.theadEl = document.createElement('thead');
                    this.tableEl.appendChild(this.theadEl);

                    this.tbodyEl = document.createElement('tbody');
                    this.tableEl.appendChild(this.tbodyEl);

                    this.tableWrapperEl.appendChild(this.tableEl);
                    this.container.appendChild(this.tableWrapperEl);

                    if (this.options.importable) {
                        this._setupDragDrop();
                    }

                    if (this.options.pagination) {
                        this.footerEl = document.createElement('div');
                        this.footerEl.className = 'data-grid-footer';

                        this.infoEl = document.createElement('div');
                        this.infoEl.className = 'data-grid-info';
                        this.footerEl.appendChild(this.infoEl);

                        const rightWrap = document.createElement('div');
                        rightWrap.className = 'd-flex align-items-center gap-3';

                        const pageSizeWrap = document.createElement('div');
                        pageSizeWrap.className = 'data-grid-page-size';
                        pageSizeWrap.innerHTML = `<span>Exibir:</span><select></select>`;
                        this.pageSizeSelect = pageSizeWrap.querySelector('select');
                        this.options.pageSizeOptions.forEach(opt => {
                            const op = document.createElement('option');
                            op.value = opt;
                            op.textContent = `${opt} / pág`;
                            if (opt === this.pageSize) op.selected = true;
                            this.pageSizeSelect.appendChild(op);
                        });
                        this.pageSizeSelect.addEventListener('change', () => {
                            this.setPageSize(parseInt(this.pageSizeSelect.value, 10));
                        });
                        rightWrap.appendChild(pageSizeWrap);

                        this.paginationEl = document.createElement('div');
                        this.paginationEl.className = 'data-grid-pagination';
                        rightWrap.appendChild(this.paginationEl);

                        this.footerEl.appendChild(rightWrap);
                        this.container.appendChild(this.footerEl);
                    }
                }

                _render() {
                    this._renderThead();
                    this._renderTbody();
                    this._renderFooter();
                }

                _renderThead() {
                    this.theadEl.innerHTML = '';
                    const tr = document.createElement('tr');

                    if (this.options.selectable) {
                        const thSelect = document.createElement('th');
                        thSelect.className = 'th-select';
                        const selectAllCb = document.createElement('input');
                        selectAllCb.type = 'checkbox';
                        selectAllCb.className = 'data-grid-checkbox';

                        const pageData = this._getCurrentPageData();
                        if (pageData.length > 0) {
                            const allSelected = pageData.every(r => this.selectedIds.has(r._gridId));
                            const someSelected = pageData.some(r => this.selectedIds.has(r._gridId));
                            selectAllCb.checked = allSelected;
                            selectAllCb.indeterminate = !allSelected && someSelected;
                        } else {
                            selectAllCb.checked = false;
                        }

                        selectAllCb.addEventListener('change', () => {
                            if (selectAllCb.checked) {
                                pageData.forEach(r => this.selectedIds.add(r._gridId));
                            } else {
                                pageData.forEach(r => this.selectedIds.delete(r._gridId));
                            }
                            this._renderTbody();
                            this._emitSelect();
                        });

                        thSelect.appendChild(selectAllCb);
                        tr.appendChild(thSelect);
                    }

                    this.columns.forEach(col => {
                        const th = document.createElement('th');
                        th.textContent = col.title || col.key;
                        th.setAttribute('data-col-key', col.key);

                        if (col.sortable !== false) {
                            th.classList.add('sortable');
                            th.innerHTML = `<span>${col.title || col.key}</span>${SORT_ICON_SVG}`;

                            if (this.sortColumn === col.key) {
                                th.classList.add(this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
                            }

                            th.addEventListener('click', () => {
                                this._handleSortClick(col.key);
                            });
                        }

                        tr.appendChild(th);
                    });

                    this.theadEl.appendChild(tr);
                }

                _renderTbody() {
                    this.tbodyEl.innerHTML = '';
                    const pageData = this._getCurrentPageData();

                    if (pageData.length === 0) {
                        const tr = document.createElement('tr');
                        const td = document.createElement('td');
                        const totalCols = this.columns.length + (this.options.selectable ? 1 : 0);
                        td.setAttribute('colspan', totalCols);
                        td.className = 'data-grid-empty';
                        td.innerHTML = `<div class="empty-icon"><i class="icon icon-info"></i></div><div>${this.options.emptyText}</div>`;
                        tr.appendChild(td);
                        this.tbodyEl.appendChild(tr);
                        return;
                    }

                    pageData.forEach(row => {
                        const tr = document.createElement('tr');
                        tr.setAttribute('data-row-id', row._gridId);
                        const isSelected = this.selectedIds.has(row._gridId);
                        if (isSelected) {
                            tr.classList.add('is-selected');
                        }

                        if (this.options.selectable) {
                            const tdSelect = document.createElement('td');
                            tdSelect.className = 'td-select';
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.className = 'data-grid-checkbox';
                            cb.checked = isSelected;

                            cb.addEventListener('change', (e) => {
                                e.stopPropagation();
                                if (cb.checked) {
                                    this.selectedIds.add(row._gridId);
                                    tr.classList.add('is-selected');
                                } else {
                                    this.selectedIds.delete(row._gridId);
                                    tr.classList.remove('is-selected');
                                }
                                this._updateSelectAllHeader();
                                this._emitSelect();
                            });

                            tdSelect.appendChild(cb);
                            tr.appendChild(tdSelect);
                        }

                        this.columns.forEach(col => {
                            const td = document.createElement('td');
                            const val = row[col.key];
                            if (typeof col.render === 'function') {
                                td.innerHTML = col.render(val, row);
                            } else {
                                td.innerHTML = val !== undefined && val !== null ? val : '';
                            }
                            tr.appendChild(td);
                        });

                        tr.addEventListener('click', (e) => {
                            if (e.target.closest('.data-grid-checkbox')) return;
                            if (this.options.selectable) {
                                const cb = tr.querySelector('.data-grid-checkbox');
                                if (cb) {
                                    cb.checked = !cb.checked;
                                    cb.dispatchEvent(new Event('change'));
                                }
                            }
                        });

                        this.tbodyEl.appendChild(tr);
                    });
                }

                _updateSelectAllHeader() {
                    const selectAllCb = this.theadEl.querySelector('.th-select input');
                    if (!selectAllCb) return;

                    const pageData = this._getCurrentPageData();
                    if (pageData.length === 0) {
                        selectAllCb.checked = false;
                        selectAllCb.indeterminate = false;
                        return;
                    }

                    const allSelected = pageData.every(r => this.selectedIds.has(r._gridId));
                    const someSelected = pageData.some(r => this.selectedIds.has(r._gridId));

                    selectAllCb.checked = allSelected;
                    selectAllCb.indeterminate = !allSelected && someSelected;
                }

                _renderFooter() {
                    if (!this.options.pagination || !this.footerEl) return;

                    const total = this.filteredData.length;
                    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
                    const start = total === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
                    const end = Math.min(total, this.currentPage * this.pageSize);

                    const selectedCount = this.selectedIds.size;
                    const selectedText = selectedCount > 0 ? ` · <span class="text-primary f-w-semibold">${selectedCount} selecionado(s)</span>` : '';

                    this.infoEl.innerHTML = `<span>Exibindo <strong>${start}</strong> a <strong>${end}</strong> de <strong>${total}</strong> registros${selectedText}</span>`;

                    this.paginationEl.innerHTML = '';

                    const prevBtn = document.createElement('button');
                    prevBtn.type = 'button';
                    prevBtn.className = 'page-btn';
                    prevBtn.innerHTML = '‹';
                    prevBtn.disabled = this.currentPage <= 1;
                    prevBtn.addEventListener('click', () => this.setPage(this.currentPage - 1));
                    this.paginationEl.appendChild(prevBtn);

                    let startPage = Math.max(1, this.currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + 4);
                    if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4);
                    }

                    for (let p = startPage; p <= endPage; p++) {
                        const pageBtn = document.createElement('button');
                        pageBtn.type = 'button';
                        pageBtn.className = `page-btn ${p === this.currentPage ? 'is-active' : ''}`;
                        pageBtn.textContent = p;
                        const pageNum = p;
                        pageBtn.addEventListener('click', () => this.setPage(pageNum));
                        this.paginationEl.appendChild(pageBtn);
                    }

                    const nextBtn = document.createElement('button');
                    nextBtn.type = 'button';
                    nextBtn.className = 'page-btn';
                    nextBtn.innerHTML = '›';
                    nextBtn.disabled = this.currentPage >= totalPages;
                    nextBtn.addEventListener('click', () => this.setPage(this.currentPage + 1));
                    this.paginationEl.appendChild(nextBtn);
                }

                _getCurrentPageData() {
                    if (!this.options.pagination) return this.filteredData;
                    const start = (this.currentPage - 1) * this.pageSize;
                    return this.filteredData.slice(start, start + this.pageSize);
                }

                _handleSortClick(key) {
                    if (this.sortColumn === key) {
                        if (this.sortDirection === 'asc') {
                            this.sortDirection = 'desc';
                        } else if (this.sortDirection === 'desc') {
                            this.sortColumn = null;
                            this.sortDirection = null;
                        }
                    } else {
                        this.sortColumn = key;
                        this.sortDirection = 'asc';
                    }
                    this._applySort();
                    this._render();
                    this._emitChange();
                }

                _applySort() {
                    if (!this.sortColumn || !this.sortDirection) {
                        const query = this.searchQuery;
                        if (query) {
                            this.filteredData = this.allData.filter(row => this._matchRow(row, query));
                        } else {
                            this.filteredData = [...this.allData];
                        }
                        return;
                    }

                    const key = this.sortColumn;
                    const dir = this.sortDirection === 'asc' ? 1 : -1;

                    this.filteredData.sort((a, b) => {
                        let valA = a[`_${key}_raw`] !== undefined ? a[`_${key}_raw`] : a[key];
                        let valB = b[`_${key}_raw`] !== undefined ? b[`_${key}_raw`] : b[key];

                        if (valA === undefined || valA === null) valA = '';
                        if (valB === undefined || valB === null) valB = '';

                        const numA = Number(valA);
                        const numB = Number(valB);

                        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
                            return (numA - numB) * dir;
                        }

                        return String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' }) * dir;
                    });
                }

                _matchRow(row, query) {
                    const q = query.toLowerCase();
                    return this.columns.some(col => {
                        const val = row[`_${col.key}_raw`] !== undefined ? row[`_${col.key}_raw`] : row[col.key];
                        if (val === undefined || val === null) return false;
                        return String(val).toLowerCase().includes(q);
                    });
                }

                filter(query) {
                    this.searchQuery = (query || '').trim();
                    if (!this.searchQuery) {
                        this.filteredData = [...this.allData];
                    } else {
                        this.filteredData = this.allData.filter(row => this._matchRow(row, this.searchQuery));
                    }
                    if (this.sortColumn && this.sortDirection) {
                        this._applySort();
                    }
                    this.currentPage = 1;
                    this._render();
                    this._emitChange();

                    this.container.dispatchEvent(new CustomEvent('frameper:datagrid:filter', {
                        bubbles: true,
                        detail: { query: this.searchQuery, count: this.filteredData.length }
                    }));

                    return this.filteredData.length;
                }

                setPage(page) {
                    const totalPages = Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
                    if (page < 1 || page > totalPages) return;
                    this.currentPage = page;
                    this._render();
                    this._emitChange();
                }

                setPageSize(size) {
                    this.pageSize = Math.max(1, size);
                    this.currentPage = 1;
                    this._render();
                    this._emitChange();
                }

                sort(columnKey, direction = 'asc') {
                    this.sortColumn = columnKey;
                    this.sortDirection = direction;
                    this._applySort();
                    this._render();
                    this._emitChange();
                }

                selectAll() {
                    this.allData.forEach(r => this.selectedIds.add(r._gridId));
                    this._renderTbody();
                    this._renderFooter();
                    this._updateSelectAllHeader();
                    this._emitSelect();
                }

                deselectAll() {
                    this.selectedIds.clear();
                    this._renderTbody();
                    this._renderFooter();
                    this._updateSelectAllHeader();
                    this._emitSelect();
                }

                getSelected() {
                    return this.allData.filter(r => this.selectedIds.has(r._gridId));
                }

                getSelectedIds() {
                    return Array.from(this.selectedIds);
                }

                setData(data) {
                    this.allData = (data || []).map((item, idx) => Object.assign({ _gridId: `row-${idx + 1}` }, item));
                    this.selectedIds.clear();
                    this.filter(this.searchQuery);
                }

                toDataset(onlySelected = false) {
                    if (this.columns.length === 0) {
                        return { title: 'Tabela', headers: [], rows: [], metadata: {} };
                    }
                    const sourceRows = (onlySelected && this.selectedIds && this.selectedIds.size > 0)
                        ? this.filteredData.filter(r => this.selectedIds.has(r._gridId))
                        : this.filteredData;

                    const headers = this.columns.map(c => c.title || c.key);
                    const rows = sourceRows.map(row => {
                        return this.columns.map(c => {
                            let val = row[`_${c.key}_raw`] !== undefined ? row[`_${c.key}_raw`] : row[c.key];
                            if (val === undefined || val === null) return '';
                            if (typeof val === 'string') {
                                val = val.replace(/<[^>]*>/g, '').trim();
                            }
                            return val;
                        });
                    });

                    const title = (this.container && typeof this.container.getAttribute === 'function' && this.container.getAttribute('data-title')) ||
                                  this.options.title ||
                                  (typeof document !== 'undefined' ? document.title : 'Tabela de Dados') ||
                                  'Tabela de Dados';

                    return {
                        title,
                        headers,
                        rows,
                        metadata: {
                            total: this.allData.length,
                            filtered: this.filteredData.length,
                            selected: this.selectedIds ? this.selectedIds.size : 0
                        }
                    };
                }

                export(format = 'xlsx', options = {}) {
                    const Converter = (typeof FramePER !== 'undefined' && FramePER.Converter)
                        ? FramePER.Converter
                        : ((typeof window !== 'undefined' && (window.FramePERConverter || (window.FramePER && window.FramePER.Converter)))
                            || (typeof FramePERConverter !== 'undefined' ? FramePERConverter : null));

                    if (!Converter) {
                        console.error('FramePER.Converter não encontrado para exportação do DataGrid.');
                        return null;
                    }

                    const onlySelected = Boolean(options.onlySelected);
                    const dataset = this.toDataset(onlySelected);
                    if (!dataset || dataset.rows.length === 0) {
                        if (typeof FramePER !== 'undefined' && FramePER.Notify) {
                            FramePER.Notify.warning('Exportação', 'Nenhum registro para exportar.');
                        }
                        return null;
                    }

                    const fmt = String(format).toLowerCase();
                    const defaultFilename = `${(dataset.title || 'dados').toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.${fmt}`;
                    const filename = options.filename || defaultFilename;
                    const shouldDownload = options.download !== false && options.autoDownload !== false;
                    const exportOptions = Object.assign({}, options, {
                        filename,
                        title: dataset.title,
                        download: shouldDownload,
                        autoDownload: shouldDownload
                    });

                    const result = Converter.convert(dataset, fmt, exportOptions);

                    if (exportOptions.download && typeof window !== 'undefined') {
                        if (typeof FramePER !== 'undefined' && FramePER.Confetti && options.confetti !== false) {
                            FramePER.Confetti.burst({ count: 60, spread: 75 });
                        }
                        if (typeof FramePER !== 'undefined' && FramePER.Notify && options.notify !== false) {
                            FramePER.Notify.success('Exportação Concluída', `Arquivo "${filename}" exportado com sucesso.`);
                        }
                    }

                    if (this.container && typeof this.container.dispatchEvent === 'function') {
                        this.container.dispatchEvent(new CustomEvent('frameper:datagrid:export', {
                            bubbles: true,
                            detail: {
                                format: fmt,
                                filename,
                                count: dataset.rows.length,
                                onlySelected
                            }
                        }));
                    }

                    return result;
                }

                exportXLSX(filename, options = {}) {
                    return this.export('xlsx', Object.assign({ filename }, options));
                }

                exportXLS(filename, options = {}) {
                    return this.export('xls', Object.assign({ filename }, options));
                }

                exportCSV(filename, options = {}) {
                    return this.export('csv', Object.assign({ filename }, options));
                }

                exportPDF(filename, options = {}) {
                    return this.export('pdf', Object.assign({ filename }, options));
                }

                exportJSON(filename, options = {}) {
                    return this.export('json', Object.assign({ filename }, options));
                }

                exportXML(filename, options = {}) {
                    return this.export('xml', Object.assign({ filename }, options));
                }

                loadDataset(dataset, options = {}) {
                    if (!dataset || !Array.isArray(dataset.headers) || !Array.isArray(dataset.rows)) {
                        return false;
                    }
                    const mode = options.mode || 'replace';

                    if (mode === 'replace') {
                        this.columns = dataset.headers.map(h => ({
                            key: h,
                            title: h.charAt(0).toUpperCase() + h.slice(1),
                            sortable: true
                        }));

                        this.allData = dataset.rows.map((row, rIdx) => {
                            const obj = { _gridId: `row-${rIdx + 1}` };
                            dataset.headers.forEach((h, cIdx) => {
                                const val = row[cIdx] !== undefined ? row[cIdx] : '';
                                obj[h] = val;
                                obj[`_${h}_raw`] = val;
                            });
                            return obj;
                        });

                        this.selectedIds.clear();
                        this.currentPage = 1;
                        if (dataset.title) {
                            this.options.title = dataset.title;
                        }

                        if (this.theadEl) {
                            this._renderThead();
                        }
                    } else if (mode === 'append') {
                        const existingCount = this.allData.length;
                        const newRows = dataset.rows.map((row, rIdx) => {
                            const obj = { _gridId: `row-${existingCount + rIdx + 1}` };
                            dataset.headers.forEach((h, cIdx) => {
                                const val = row[cIdx] !== undefined ? row[cIdx] : '';
                                obj[h] = val;
                                obj[`_${h}_raw`] = val;
                            });
                            return obj;
                        });
                        this.allData = this.allData.concat(newRows);
                    }

                    this.filter(this.searchQuery || '');

                    if (this.container && typeof this.container.dispatchEvent === 'function') {
                        this.container.dispatchEvent(new CustomEvent('frameper:datagrid:import', {
                            bubbles: true,
                            detail: {
                                dataset,
                                mode,
                                count: dataset.rows.length,
                                total: this.allData.length
                            }
                        }));
                    }

                    return true;
                }

                async importFile(file, options = {}) {
                    const Converter = (typeof FramePER !== 'undefined' && FramePER.Converter)
                        ? FramePER.Converter
                        : ((typeof window !== 'undefined' && (window.FramePERConverter || (window.FramePER && window.FramePER.Converter)))
                            || (typeof FramePERConverter !== 'undefined' ? FramePERConverter : null));

                    if (!Converter || typeof Converter.readFile !== 'function') {
                        console.error('FramePER.Converter.readFile não encontrado para importação no DataGrid.');
                        return null;
                    }

                    try {
                        const dataset = await Converter.readFile(file, options);
                        if (!dataset) return null;

                        this.loadDataset(dataset, options);

                        if (typeof window !== 'undefined') {
                            if (typeof FramePER !== 'undefined' && FramePER.Confetti && options.confetti !== false) {
                                FramePER.Confetti.burst({ count: 60, spread: 75 });
                            }
                            if (typeof FramePER !== 'undefined' && FramePER.Notify && options.notify !== false) {
                                const fileName = file && file.name ? ` (${file.name})` : '';
                                FramePER.Notify.success('Arquivo Importado', `${dataset.rows.length} registros carregados com sucesso${fileName}.`);
                            }
                        }

                        return dataset;
                    } catch (err) {
                        console.error('Erro ao importar arquivo no DataGrid:', err);
                        if (typeof FramePER !== 'undefined' && FramePER.Notify && options.notify !== false) {
                            FramePER.Notify.error('Erro na Importação', err.message || 'Falha ao processar arquivo.');
                        }
                        throw err;
                    }
                }

                _setupDragDrop() {
                    const target = this.tableWrapperEl || this.container;
                    if (!target || typeof target.addEventListener !== 'function') return;

                    let dragCounter = 0;
                    ['dragenter', 'dragover'].forEach(name => {
                        target.addEventListener(name, (e) => {
                            e.preventDefault();
                            if (e.stopPropagation) e.stopPropagation();
                            dragCounter++;
                            if (target.classList && target.classList.add) target.classList.add('data-grid-dragover');
                        });
                    });

                    ['dragleave'].forEach(name => {
                        target.addEventListener(name, (e) => {
                            e.preventDefault();
                            if (e.stopPropagation) e.stopPropagation();
                            dragCounter--;
                            if (dragCounter <= 0 && target.classList && target.classList.remove) {
                                target.classList.remove('data-grid-dragover');
                                dragCounter = 0;
                            }
                        });
                    });

                    target.addEventListener('drop', (e) => {
                        e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        if (target.classList && target.classList.remove) target.classList.remove('data-grid-dragover');
                        dragCounter = 0;
                        const dt = e.dataTransfer;
                        if (dt && dt.files && dt.files.length > 0) {
                            this.importFile(dt.files[0]);
                        }
                    });
                }

                _emitSelect() {
                    const selected = this.getSelected();
                    if (typeof this.options.onSelect === 'function') {
                        this.options.onSelect(selected);
                    }
                    this.container.dispatchEvent(new CustomEvent('frameper:datagrid:select', {
                        bubbles: true,
                        detail: { selected, count: selected.length }
                    }));
                }

                _emitChange() {
                    const state = {
                        page: this.currentPage,
                        pageSize: this.pageSize,
                        total: this.filteredData.length,
                        sortColumn: this.sortColumn,
                        sortDirection: this.sortDirection
                    };
                    if (typeof this.options.onChange === 'function') {
                        this.options.onChange(state);
                    }
                    this.container.dispatchEvent(new CustomEvent('frameper:datagrid:change', {
                        bubbles: true,
                        detail: state
                    }));
                }

                destroy() {
                    delete this.container._frameDataGrid;
                    this.container.innerHTML = '';
                }
            }

            return {
                create: (container, options) => new Instance(container, options),
                get: (container) => {
                    const el = typeof container === 'string' ? document.querySelector(container) : container;
                    return el ? el._frameDataGrid : null;
                },
                init: () => {
                    document.querySelectorAll('[data-grid], [data-datagrid]').forEach(el => {
                        if (!el._frameDataGrid) {
                            new Instance(el);
                        }
                    });
                }
            };
        })(),

        Kanban: (() => {
            class Instance {
                constructor(container, options = {}) {
                    this.container = typeof container === 'string' ? document.querySelector(container) : container;
                    if (!this.container) return;

                    this.options = Object.assign({
                        persist: this.container.getAttribute('data-persist') || null,
                        onMove: null,
                        onAdd: null,
                        onRemove: null
                    }, options);

                    this._draggedCard = null;
                    this._sourceColumn = null;
                    this._placeholder = document.createElement('div');
                    this._placeholder.className = 'kanban-drop-placeholder';

                    this._init();
                    this.container._frameKanban = this;
                }

                _init() {
                    this.container.classList.add('kanban-board');
                    this._setupColumnsAndCards();
                    this._bindEvents();

                    if (this.options.persist) {
                        this._restoreState();
                    }
                    this.updateCounts();
                }

                _setupColumnsAndCards() {
                    const columns = this.container.querySelectorAll('.kanban-column');
                    columns.forEach((col, idx) => {
                        if (!col.getAttribute('data-column-id')) {
                            col.setAttribute('data-column-id', `col-${idx + 1}`);
                        }

                        let body = col.querySelector('.kanban-column-body');
                        if (!body) {
                            body = document.createElement('div');
                            body.className = 'kanban-column-body';
                            col.appendChild(body);
                        }

                        const header = col.querySelector('.kanban-column-header');
                        if (header && !header.querySelector('.kanban-count')) {
                            const countBadge = document.createElement('span');
                            countBadge.className = 'kanban-count';
                            countBadge.textContent = '0';
                            header.appendChild(countBadge);
                        }
                    });

                    const cards = this.container.querySelectorAll('.kanban-card');
                    cards.forEach((card, idx) => {
                        card.setAttribute('draggable', 'true');
                        if (!card.getAttribute('data-card-id')) {
                            card.setAttribute('data-card-id', `card-${idx + 1}`);
                        }
                    });
                }

                _bindEvents() {
                    this._handleDragStart = (e) => {
                        const card = e.target.closest('.kanban-card');
                        if (!card) return;

                        this._draggedCard = card;
                        this._sourceColumn = card.closest('.kanban-column');
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', card.getAttribute('data-card-id') || '');

                        setTimeout(() => {
                            if (this._draggedCard) {
                                this._draggedCard.classList.add('is-dragging');
                            }
                        }, 0);
                    };

                    this._handleDragEnd = (e) => {
                        const card = e.target.closest('.kanban-card');
                        if (card) {
                            card.classList.remove('is-dragging');
                        }

                        if (this._placeholder && this._placeholder.parentNode) {
                            this._placeholder.remove();
                        }

                        this.container.querySelectorAll('.kanban-column').forEach(c => {
                            c.classList.remove('is-drag-over');
                        });

                        this._draggedCard = null;
                        this._sourceColumn = null;
                        this.updateCounts();
                        this._saveState();
                    };

                    this._handleDragOver = (e) => {
                        if (!this._draggedCard) return;

                        const column = e.target.closest('.kanban-column');
                        if (!column) return;

                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';

                        const body = column.querySelector('.kanban-column-body');
                        if (!body) return;

                        column.classList.add('is-drag-over');

                        const afterElement = this._getDragAfterElement(body, e.clientY);
                        if (!afterElement) {
                            body.appendChild(this._placeholder);
                        } else {
                            body.insertBefore(this._placeholder, afterElement);
                        }
                    };

                    this._handleDragLeave = (e) => {
                        const column = e.target.closest('.kanban-column');
                        if (column && !column.contains(e.relatedTarget)) {
                            column.classList.remove('is-drag-over');
                        }
                    };

                    this._handleDrop = (e) => {
                        if (!this._draggedCard) return;

                        const column = e.target.closest('.kanban-column');
                        if (!column) return;

                        e.preventDefault();

                        const body = column.querySelector('.kanban-column-body');
                        if (!body) return;

                        const fromColumnId = this._sourceColumn ? this._sourceColumn.getAttribute('data-column-id') : null;
                        const toColumnId = column.getAttribute('data-column-id');
                        const cardId = this._draggedCard.getAttribute('data-card-id');

                        if (this._placeholder && this._placeholder.parentNode === body) {
                            body.insertBefore(this._draggedCard, this._placeholder);
                            this._placeholder.remove();
                        } else {
                            body.appendChild(this._draggedCard);
                        }

                        this._draggedCard.classList.remove('is-dragging');
                        column.classList.remove('is-drag-over');

                        const newIndex = Array.from(body.querySelectorAll('.kanban-card')).indexOf(this._draggedCard);

                        this.updateCounts();
                        this._saveState();

                        const eventData = { cardId, fromColumnId, toColumnId, newIndex, card: this._draggedCard };
                        if (typeof this.options.onMove === 'function') {
                            this.options.onMove(eventData);
                        }
                        this.container.dispatchEvent(new CustomEvent('frameper:kanban:move', {
                            bubbles: true,
                            detail: eventData
                        }));
                    };

                    this.container.addEventListener('dragstart', this._handleDragStart);
                    this.container.addEventListener('dragend', this._handleDragEnd);
                    this.container.addEventListener('dragover', this._handleDragOver);
                    this.container.addEventListener('dragleave', this._handleDragLeave);
                    this.container.addEventListener('drop', this._handleDrop);
                }

                _getDragAfterElement(container, y) {
                    const draggableElements = [...container.querySelectorAll('.kanban-card:not(.is-dragging)')];

                    return draggableElements.reduce((closest, child) => {
                        const box = child.getBoundingClientRect();
                        const offset = y - box.top - box.height / 2;
                        if (offset < 0 && offset > closest.offset) {
                            return { offset, element: child };
                        } else {
                            return closest;
                        }
                    }, { offset: Number.NEGATIVE_INFINITY }).element;
                }

                updateCounts() {
                    const columns = this.container.querySelectorAll('.kanban-column');
                    columns.forEach(col => {
                        const countBadge = col.querySelector('.kanban-count');
                        const cards = col.querySelectorAll('.kanban-card');
                        if (countBadge) {
                            countBadge.textContent = cards.length;
                        }
                    });
                }

                addCard(columnId, cardData = {}) {
                    const column = this.container.querySelector(`.kanban-column[data-column-id="${columnId}"]`);
                    if (!column) return null;

                    const body = column.querySelector('.kanban-column-body');
                    if (!body) return null;

                    const card = document.createElement('div');
                    card.className = 'kanban-card';
                    card.setAttribute('draggable', 'true');
                    const id = cardData.id || `card-${Date.now()}`;
                    card.setAttribute('data-card-id', id);

                    let html = '';
                    if (cardData.tags && Array.isArray(cardData.tags)) {
                        html += '<div class="kanban-card-tags">';
                        cardData.tags.forEach(t => {
                            html += `<span class="badge ${t.className || 'badge-subtle badge-xs'}">${t.label || t}</span>`;
                        });
                        html += '</div>';
                    }

                    if (cardData.title) {
                        html += `<div class="kanban-card-title">${cardData.title}</div>`;
                    }
                    if (cardData.desc) {
                        html += `<div class="kanban-card-desc">${cardData.desc}</div>`;
                    }

                    if (cardData.meta || cardData.assignee || cardData.date) {
                        html += '<div class="kanban-card-footer">';
                        html += '<div class="kanban-card-meta">';
                        if (cardData.date) {
                            html += `<span><i class="icon icon-clock"></i> ${cardData.date}</span>`;
                        }
                        if (cardData.meta) {
                            html += `<span>${cardData.meta}</span>`;
                        }
                        html += '</div>';
                        if (cardData.assignee) {
                            html += `<span class="badge badge-pill badge-primary badge-xs">${cardData.assignee}</span>`;
                        }
                        html += '</div>';
                    }

                    card.innerHTML = html;
                    body.appendChild(card);

                    this.updateCounts();
                    this._saveState();

                    const detail = { columnId, cardId: id, card };
                    if (typeof this.options.onAdd === 'function') {
                        this.options.onAdd(detail);
                    }
                    this.container.dispatchEvent(new CustomEvent('frameper:kanban:add', {
                        bubbles: true,
                        detail
                    }));

                    return card;
                }

                removeCard(cardId) {
                    const card = this.container.querySelector(`.kanban-card[data-card-id="${cardId}"]`);
                    if (!card) return false;

                    card.remove();
                    this.updateCounts();
                    this._saveState();

                    if (typeof this.options.onRemove === 'function') {
                        this.options.onRemove({ cardId });
                    }
                    this.container.dispatchEvent(new CustomEvent('frameper:kanban:remove', {
                        bubbles: true,
                        detail: { cardId }
                    }));

                    return true;
                }

                moveCard(cardId, targetColumnId, newIndex = null) {
                    const card = this.container.querySelector(`.kanban-card[data-card-id="${cardId}"]`);
                    const targetCol = this.container.querySelector(`.kanban-column[data-column-id="${targetColumnId}"]`);
                    if (!card || !targetCol) return false;

                    const body = targetCol.querySelector('.kanban-column-body');
                    if (!body) return false;

                    const cards = Array.from(body.querySelectorAll('.kanban-card'));
                    if (newIndex === null || newIndex >= cards.length) {
                        body.appendChild(card);
                    } else {
                        body.insertBefore(card, cards[newIndex]);
                    }

                    this.updateCounts();
                    this._saveState();
                    return true;
                }

                getColumns() {
                    return Array.from(this.container.querySelectorAll('.kanban-column')).map(col => ({
                        id: col.getAttribute('data-column-id'),
                        title: (col.querySelector('.kanban-column-title') || {}).textContent || '',
                        cardCount: col.querySelectorAll('.kanban-card').length
                    }));
                }

                getCards(columnId) {
                    const col = this.container.querySelector(`.kanban-column[data-column-id="${columnId}"]`);
                    if (!col) return [];
                    return Array.from(col.querySelectorAll('.kanban-card')).map(card => ({
                        id: card.getAttribute('data-card-id'),
                        title: (card.querySelector('.kanban-card-title') || {}).textContent || '',
                        element: card
                    }));
                }

                getState() {
                    const state = {};
                    this.container.querySelectorAll('.kanban-column').forEach(col => {
                        const colId = col.getAttribute('data-column-id');
                        const cardIds = Array.from(col.querySelectorAll('.kanban-card')).map(c => c.getAttribute('data-card-id'));
                        state[colId] = cardIds;
                    });
                    return state;
                }

                _saveState() {
                    if (!this.options.persist) return;
                    try {
                        localStorage.setItem(this.options.persist, JSON.stringify(this.getState()));
                    } catch (e) {}
                }

                _restoreState() {
                    if (!this.options.persist) return;
                    try {
                        const raw = localStorage.getItem(this.options.persist);
                        if (!raw) return;
                        const state = JSON.parse(raw);

                        Object.keys(state).forEach(colId => {
                            const col = this.container.querySelector(`.kanban-column[data-column-id="${colId}"]`);
                            if (!col) return;
                            const body = col.querySelector('.kanban-column-body');
                            if (!body) return;

                            state[colId].forEach(cardId => {
                                const card = this.container.querySelector(`.kanban-card[data-card-id="${cardId}"]`);
                                if (card) {
                                    body.appendChild(card);
                                }
                            });
                        });
                    } catch (e) {}
                }

                destroy() {
                    this.container.removeEventListener('dragstart', this._handleDragStart);
                    this.container.removeEventListener('dragend', this._handleDragEnd);
                    this.container.removeEventListener('dragover', this._handleDragOver);
                    this.container.removeEventListener('dragleave', this._handleDragLeave);
                    this.container.removeEventListener('drop', this._handleDrop);
                    delete this.container._frameKanban;
                }
            }

            return {
                create: (container, options) => new Instance(container, options),
                get: (container) => {
                    const el = typeof container === 'string' ? document.querySelector(container) : container;
                    return el ? el._frameKanban : null;
                },
                init: () => {
                    document.querySelectorAll('[data-kanban], .kanban-board').forEach(el => {
                        if (!el._frameKanban) {
                            new Instance(el);
                        }
                    });
                }
            };
        })(),

        Timeline: (() => {
            class Instance {
                constructor(container, options = {}) {
                    this.container = typeof container === 'string' ? document.querySelector(container) : container;
                    if (!this.container) return;

                    this.options = Object.assign({
                        items: null,
                        compact: this.container.classList.contains('timeline-compact') || this.container.getAttribute('data-compact') === 'true',
                        onChange: null
                    }, options);

                    this._init();
                    this.container._frameTimeline = this;
                }

                _init() {
                    this.container.classList.add('timeline');
                    if (this.options.compact) {
                        this.container.classList.add('timeline-compact');
                    }

                    if (Array.isArray(this.options.items) && this.options.items.length > 0) {
                        this.container.innerHTML = '';
                        this.options.items.forEach(item => this.addItem(item));
                    } else {
                        this._enhanceDOM();
                    }
                }

                _enhanceDOM() {
                    const items = this.container.querySelectorAll('.timeline-item');
                    items.forEach((item, idx) => {
                        if (!item.getAttribute('data-item-id')) {
                            item.setAttribute('data-item-id', `timeline-item-${idx + 1}`);
                        }

                        let axis = item.querySelector('.timeline-axis');
                        if (!axis) {
                            axis = document.createElement('div');
                            axis.className = 'timeline-axis';

                            let point = item.querySelector('.timeline-point');
                            if (!point) {
                                point = document.createElement('div');
                                point.className = 'timeline-point point-primary';
                                point.innerHTML = '<i class="icon icon-check"></i>';
                            }
                            axis.appendChild(point);

                            let connector = document.createElement('div');
                            connector.className = 'timeline-connector';
                            if (item.classList.contains('is-completed')) {
                                connector.classList.add('is-completed');
                            }
                            axis.appendChild(connector);

                            item.insertBefore(axis, item.firstChild);
                        }
                    });
                }

                addItem(data = {}, prepend = false) {
                    const item = document.createElement('li');
                    item.className = 'timeline-item';
                    const id = data.id || `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
                    item.setAttribute('data-item-id', id);

                    if (data.status) {
                        item.classList.add(`is-${data.status}`);
                    }

                    const axis = document.createElement('div');
                    axis.className = 'timeline-axis';

                    const point = document.createElement('div');
                    point.className = `timeline-point point-${data.color || 'primary'}`;
                    if (data.pulse) {
                        point.classList.add('has-pulse');
                    }
                    if (data.dot) {
                        point.classList.add('point-dot');
                    }

                    if (data.icon) {
                        point.innerHTML = data.icon.startsWith('<') ? data.icon : `<i class="icon ${data.icon}"></i>`;
                    } else if (!data.dot) {
                        point.innerHTML = '<i class="icon icon-check"></i>';
                    }
                    axis.appendChild(point);

                    const connector = document.createElement('div');
                    connector.className = 'timeline-connector';
                    if (data.status === 'completed' || data.completed) {
                        connector.classList.add('is-completed');
                    }
                    if (data.dashed) {
                        connector.classList.add('is-dashed');
                    }
                    axis.appendChild(connector);

                    item.appendChild(axis);

                    const content = document.createElement('div');
                    content.className = 'timeline-content';

                    const header = document.createElement('div');
                    header.className = 'timeline-header';

                    if (data.title) {
                        const title = document.createElement('h4');
                        title.className = 'timeline-title';
                        title.textContent = data.title;
                        header.appendChild(title);
                    }

                    if (data.badge) {
                        const badge = document.createElement('span');
                        badge.className = `badge ${data.badgeClass || 'badge-subtle badge-xs'}`;
                        badge.textContent = data.badge;
                        header.appendChild(badge);
                    }

                    if (data.time || data.date) {
                        const time = document.createElement('span');
                        time.className = 'timeline-time';
                        time.textContent = data.time || data.date;
                        header.appendChild(time);
                    }

                    content.appendChild(header);

                    if (data.desc || data.body) {
                        const body = document.createElement('p');
                        body.className = 'timeline-body';
                        body.innerHTML = data.desc || data.body;
                        content.appendChild(body);
                    }

                    item.appendChild(content);

                    if (prepend && this.container.firstChild) {
                        this.container.insertBefore(item, this.container.firstChild);
                    } else {
                        this.container.appendChild(item);
                    }

                    this._emitChange('add', { id, item, data });
                    return item;
                }

                removeItem(itemId) {
                    const item = this.container.querySelector(`.timeline-item[data-item-id="${itemId}"]`);
                    if (!item) return false;
                    item.remove();
                    this._emitChange('remove', { id: itemId });
                    return true;
                }

                setStatus(itemId, status, color = null) {
                    const item = this.container.querySelector(`.timeline-item[data-item-id="${itemId}"]`);
                    if (!item) return false;

                    item.classList.remove('is-completed', 'is-active', 'is-pending');
                    if (status) {
                        item.classList.add(`is-${status}`);
                    }

                    const point = item.querySelector('.timeline-point');
                    if (point && color) {
                        point.className = point.className.replace(/point-[a-z]+/g, '').trim();
                        point.classList.add(`point-${color}`);
                    }

                    const connector = item.querySelector('.timeline-connector');
                    if (connector) {
                        if (status === 'completed') {
                            connector.classList.add('is-completed');
                        } else {
                            connector.classList.remove('is-completed');
                        }
                    }

                    this._emitChange('status', { id: itemId, status });
                    return true;
                }

                getItems() {
                    return Array.from(this.container.querySelectorAll('.timeline-item')).map(item => ({
                        id: item.getAttribute('data-item-id'),
                        title: (item.querySelector('.timeline-title') || {}).textContent || '',
                        status: item.classList.contains('is-completed') ? 'completed' : (item.classList.contains('is-active') ? 'active' : (item.classList.contains('is-pending') ? 'pending' : 'default')),
                        element: item
                    }));
                }

                _emitChange(type, detail) {
                    const evtData = Object.assign({ type }, detail);
                    if (typeof this.options.onChange === 'function') {
                        this.options.onChange(evtData);
                    }
                    this.container.dispatchEvent(new CustomEvent('frameper:timeline:change', {
                        bubbles: true,
                        detail: evtData
                    }));
                }

                destroy() {
                    delete this.container._frameTimeline;
                }
            }

            return {
                create: (container, options) => new Instance(container, options),
                get: (container) => {
                    const el = typeof container === 'string' ? document.querySelector(container) : container;
                    return el ? el._frameTimeline : null;
                },
                init: () => {
                    document.querySelectorAll('[data-timeline], .timeline').forEach(el => {
                        if (!el._frameTimeline) {
                            new Instance(el);
                        }
                    });
                }
            };
        })(),

        Tour: (() => {
            class Instance {
                constructor(options = {}) {
                    this.options = Object.assign({
                        steps: [],
                        keyboard: true,
                        padding: 8,
                        onStart: null,
                        onStepChange: null,
                        onComplete: null,
                        onSkip: null
                    }, options);

                    this.currentIndex = -1;
                    this.isActive = false;
                    this.overlay = null;
                    this.spotlight = null;
                    this.popover = null;
                    this._onKeyDown = this._onKeyDown.bind(this);
                    this._onResize = this._onResize.bind(this);
                }

                _ensureDOM() {
                    if (!this.overlay) {
                        this.overlay = document.createElement('div');
                        this.overlay.className = 'tour-overlay';

                        this.spotlight = document.createElement('div');
                        this.spotlight.className = 'tour-spotlight';
                        this.overlay.appendChild(this.spotlight);

                        this.popover = document.createElement('div');
                        this.popover.className = 'tour-popover';
                        this.popover.innerHTML = `
                            <div class="tour-arrow"></div>
                            <div class="tour-header">
                                <span class="tour-step-badge"></span>
                                <button type="button" class="tour-close-btn" aria-label="Fechar tour">&times;</button>
                            </div>
                            <h3 class="tour-title"></h3>
                            <div class="tour-body"></div>
                            <div class="tour-footer">
                                <div class="tour-dots"></div>
                                <div class="tour-actions">
                                    <button type="button" class="btn btn-ghost btn-xs tour-skip-btn">Pular</button>
                                    <button type="button" class="btn btn-outline btn-xs tour-prev-btn">Anterior</button>
                                    <button type="button" class="btn btn-primary btn-xs tour-next-btn">Próximo</button>
                                </div>
                            </div>
                        `;
                        document.body.appendChild(this.overlay);
                        document.body.appendChild(this.popover);

                        this.popover.querySelector('.tour-close-btn').addEventListener('click', () => this.end(true));
                        this.popover.querySelector('.tour-skip-btn').addEventListener('click', () => this.end(true));
                        this.popover.querySelector('.tour-prev-btn').addEventListener('click', () => this.prev());
                        this.popover.querySelector('.tour-next-btn').addEventListener('click', () => this.next());
                    }
                }

                start(stepIndex = 0) {
                    if (!this.options.steps || this.options.steps.length === 0) {
                        this._discoverSteps();
                    }
                    if (this.options.steps.length === 0) return;

                    this._ensureDOM();
                    this.isActive = true;
                    this.overlay.classList.add('is-active');

                    if (this.options.keyboard) {
                        window.addEventListener('keydown', this._onKeyDown);
                    }
                    window.addEventListener('resize', this._onResize);
                    window.addEventListener('scroll', this._onResize, true);

                    this._emit('start');
                    this.goTo(stepIndex);
                }

                _discoverSteps() {
                    const els = Array.from(document.querySelectorAll('[data-tour-step]')).sort((a, b) => {
                        return (parseInt(a.getAttribute('data-tour-step')) || 0) - (parseInt(b.getAttribute('data-tour-step')) || 0);
                    });
                    this.options.steps = els.map(el => ({
                        target: el,
                        title: el.getAttribute('data-tour-title') || '',
                        content: el.getAttribute('data-tour-content') || '',
                        placement: el.getAttribute('data-tour-placement') || 'bottom',
                        rounded: el.getAttribute('data-tour-rounded') === 'true'
                    }));
                }

                goTo(index) {
                    if (index < 0 || index >= this.options.steps.length) return;
                    this.currentIndex = index;
                    const step = this.options.steps[this.currentIndex];

                    const target = typeof step.target === 'string' ? document.querySelector(step.target) : step.target;
                    if (!target) {
                        if (index < this.options.steps.length - 1) {
                            this.goTo(index + 1);
                        } else {
                            this.end();
                        }
                        return;
                    }

                    document.querySelectorAll('.tour-target-highlight').forEach(el => el.classList.remove('tour-target-highlight'));
                    target.classList.add('tour-target-highlight');

                    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

                    setTimeout(() => {
                        this._positionSpotlightAndPopover(target, step);
                    }, 220);

                    if (typeof this.options.onStepChange === 'function') {
                        this.options.onStepChange(this.currentIndex, step);
                    }
                    this._emit('change', { stepIndex: this.currentIndex, step });
                }

                _positionSpotlightAndPopover(target, step) {
                    if (!this.isActive) return;

                    const rect = target.getBoundingClientRect();
                    const pad = this.options.padding || 8;

                    this.spotlight.style.top = `${Math.max(0, rect.top - pad)}px`;
                    this.spotlight.style.left = `${Math.max(0, rect.left - pad)}px`;
                    this.spotlight.style.width = `${rect.width + pad * 2}px`;
                    this.spotlight.style.height = `${rect.height + pad * 2}px`;
                    this.spotlight.classList.toggle('is-rounded', !!step.rounded);

                    this.popover.querySelector('.tour-step-badge').textContent = `Passo ${this.currentIndex + 1} de ${this.options.steps.length}`;
                    this.popover.querySelector('.tour-title').textContent = step.title || '';
                    this.popover.querySelector('.tour-body').innerHTML = step.content || step.desc || '';

                    const dotsContainer = this.popover.querySelector('.tour-dots');
                    dotsContainer.innerHTML = '';
                    this.options.steps.forEach((_, idx) => {
                        const dot = document.createElement('span');
                        dot.className = `tour-dot ${idx === this.currentIndex ? 'is-active' : ''}`;
                        dotsContainer.appendChild(dot);
                    });

                    const prevBtn = this.popover.querySelector('.tour-prev-btn');
                    const nextBtn = this.popover.querySelector('.tour-next-btn');
                    const skipBtn = this.popover.querySelector('.tour-skip-btn');

                    prevBtn.style.display = this.currentIndex === 0 ? 'none' : 'inline-flex';
                    if (this.currentIndex === this.options.steps.length - 1) {
                        nextBtn.textContent = 'Concluir';
                        skipBtn.style.display = 'none';
                    } else {
                        nextBtn.textContent = 'Próximo';
                        skipBtn.style.display = 'inline-flex';
                    }

                    const placement = step.placement || 'bottom';
                    this.popover.setAttribute('data-placement', placement);

                    const popoverRect = this.popover.getBoundingClientRect();
                    const popW = popoverRect.width || 340;
                    const popH = popoverRect.height || 180;
                    const margin = 14;

                    let top = 0;
                    let left = 0;

                    if (placement === 'bottom') {
                        top = rect.bottom + pad + margin;
                        left = rect.left + rect.width / 2 - popW / 2;
                    } else if (placement === 'top') {
                        top = rect.top - pad - margin - popH;
                        left = rect.left + rect.width / 2 - popW / 2;
                    } else if (placement === 'left') {
                        top = rect.top + rect.height / 2 - popH / 2;
                        left = rect.left - pad - margin - popW;
                    } else if (placement === 'right') {
                        top = rect.top + rect.height / 2 - popH / 2;
                        left = rect.right + pad + margin;
                    }

                    const maxLeft = window.innerWidth - popW - 12;
                    const maxTop = window.innerHeight - popH - 12;
                    left = Math.max(12, Math.min(left, maxLeft));
                    top = Math.max(12, Math.min(top, maxTop));

                    this.popover.style.top = `${top}px`;
                    this.popover.style.left = `${left}px`;
                    this.popover.classList.add('is-visible');
                }

                next() {
                    if (this.currentIndex < this.options.steps.length - 1) {
                        this.goTo(this.currentIndex + 1);
                    } else {
                        this.end(false);
                    }
                }

                prev() {
                    if (this.currentIndex > 0) {
                        this.goTo(this.currentIndex - 1);
                    }
                }

                end(skipped = false) {
                    if (!this.isActive) return;
                    this.isActive = false;

                    if (this.overlay) {
                        this.overlay.classList.remove('is-active');
                    }
                    if (this.popover) {
                        this.popover.classList.remove('is-visible');
                    }
                    document.querySelectorAll('.tour-target-highlight').forEach(el => el.classList.remove('tour-target-highlight'));

                    window.removeEventListener('keydown', this._onKeyDown);
                    window.removeEventListener('resize', this._onResize);
                    window.removeEventListener('scroll', this._onResize, true);

                    if (skipped) {
                        if (typeof this.options.onSkip === 'function') this.options.onSkip();
                        this._emit('skip');
                    } else {
                        if (typeof this.options.onComplete === 'function') this.options.onComplete();
                        this._emit('complete');
                    }
                }

                _onKeyDown(e) {
                    if (!this.isActive) return;
                    if (e.key === 'ArrowRight' || e.key === 'Enter') {
                        e.preventDefault();
                        this.next();
                    } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        this.prev();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        this.end(true);
                    }
                }

                _onResize() {
                    if (!this.isActive || this.currentIndex === -1) return;
                    const step = this.options.steps[this.currentIndex];
                    const target = typeof step.target === 'string' ? document.querySelector(step.target) : step.target;
                    if (target) {
                        this._positionSpotlightAndPopover(target, step);
                    }
                }

                _emit(type, detail = {}) {
                    document.dispatchEvent(new CustomEvent(`frameper:tour:${type}`, {
                        bubbles: true,
                        detail
                    }));
                }
            }

            return {
                create: (options) => new Instance(options),
                start: (options) => {
                    const tour = new Instance(options);
                    tour.start();
                    return tour;
                },
                init: () => {
                    document.querySelectorAll('[data-tour-start]').forEach(btn => {
                        if (!btn._frameTourBound) {
                            btn._frameTourBound = true;
                            btn.addEventListener('click', () => {
                                const tour = new Instance();
                                tour.start();
                            });
                        }
                    });
                }
            };
        })()
    };

    window.addEventListener('offline', () => {
        FramePER.Notify.error('Sem conexão', 'Você perdeu a conexão com a internet.', 0);
    });
    
    window.addEventListener('online', () => {
        FramePER.Notify.success('Conectado', 'A conexão com a internet foi restaurada!', 5000);
    });

    // Auto-init UI when DOM is ready

    document.addEventListener("DOMContentLoaded", () => {
        FramePER.Theme.init();
        FramePER.Backgrounds.init();
        FramePER.UI.init();
        FramePER.Clipboard.init();
        FramePER.Form.init();
        FramePER.Counter.init();
        FramePER.Scroll.init();
        if (FramePER.Chart && FramePER.Chart.autoInit) {
            FramePER.Chart.autoInit();
        }
        if (FramePER.CommandPalette && FramePER.CommandPalette.init) {
            FramePER.CommandPalette.init();
        }
        if (FramePER.Datepicker && FramePER.Datepicker.init) {
            FramePER.Datepicker.init();
        }
        if (FramePER.Select && FramePER.Select.init) {
            FramePER.Select.init();
        }
        if (FramePER.Upload && FramePER.Upload.init) {
            FramePER.Upload.init();
        }
        if (FramePER.Tabs && FramePER.Tabs.init) {
            FramePER.Tabs.init();
        }
        if (FramePER.Accordion && FramePER.Accordion.init) {
            FramePER.Accordion.init();
        }
        if (FramePER.Popover && FramePER.Popover.init) {
            FramePER.Popover.init();
        }
        if (FramePER.ContextMenu && FramePER.ContextMenu.init) {
            FramePER.ContextMenu.init();
        }
        if (FramePER.FormValidator && FramePER.FormValidator.init) {
            FramePER.FormValidator.init();
        }
        if (FramePER.ActivityFeed && FramePER.ActivityFeed.init) {
            FramePER.ActivityFeed.init();
        }
        if (FramePER.SplitPane && FramePER.SplitPane.init) {
            FramePER.SplitPane.init();
        }
        if (FramePER.TreeView && FramePER.TreeView.init) {
            FramePER.TreeView.init();
        }
        if (FramePER.DataGrid && FramePER.DataGrid.init) {
            FramePER.DataGrid.init();
        }
        if (FramePER.Kanban && FramePER.Kanban.init) {
            FramePER.Kanban.init();
        }
        if (FramePER.Timeline && FramePER.Timeline.init) {
            FramePER.Timeline.init();
        }
    });

    // ==========================================
    // SEGMENTED CONTROL COMPONENT
    // ==========================================
    const SegmentedControl = {
        init() {
            document.querySelectorAll('[data-segmented-control]').forEach(el => {
                if (el._segmentedControlInitialized) return;
                el._segmentedControlInitialized = true;
                
                const items = el.querySelectorAll('.segmented-item');
                items.forEach((item, index) => {
                    item.addEventListener('click', (e) => {
                        if (item.classList.contains('disabled') || item.disabled) return;
                        items.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        
                        const value = item.getAttribute('data-value') || item.innerText.trim();
                        const event = new CustomEvent('change', {
                            detail: { value, index, item },
                            bubbles: true
                        });
                        el.dispatchEvent(event);
                    });
                });
            });
        }
    };
    FramePER.SegmentedControl = SegmentedControl;

    // ==========================================
    // RATING COMPONENT
    // ==========================================
    const Rating = {
        init() {
            document.querySelectorAll('[data-rating]').forEach(el => {
                if (el._ratingInitialized) return;
                el._ratingInitialized = true;
                
                const isInteractive = el.classList.contains('rating-interactive') || el.hasAttribute('data-interactive');
                if (!isInteractive) return;
                
                const stars = el.querySelectorAll('.rating-star');
                const scoreDisplay = el.querySelector('.rating-score');
                let currentVal = parseInt(el.getAttribute('data-value') || '0', 10);
                
                const updateStars = (val) => {
                    stars.forEach((star, idx) => {
                        if (idx < val) {
                            star.classList.add('active', 'is-filled');
                        } else {
                            star.classList.remove('active', 'is-filled');
                        }
                    });
                    if (scoreDisplay) scoreDisplay.textContent = val > 0 ? val.toFixed(1) : '';
                };

                updateStars(currentVal);

                stars.forEach((star, idx) => {
                    star.addEventListener('mouseenter', () => {
                        updateStars(idx + 1);
                    });
                    star.addEventListener('mouseleave', () => {
                        updateStars(currentVal);
                    });
                    star.addEventListener('click', () => {
                        currentVal = idx + 1;
                        el.setAttribute('data-value', currentVal);
                        updateStars(currentVal);
                        el.dispatchEvent(new CustomEvent('change', {
                            detail: { rating: currentVal },
                            bubbles: true
                        }));
                    });
                });
            });
        }
    };
    FramePER.Rating = Rating;

    // ==========================================
    // SCROLL REVEAL ENGINE
    // ==========================================
    const ScrollReveal = {
        init() {
            const elements = document.querySelectorAll('[data-reveal]');
            if (!elements.length) return;
            if (!('IntersectionObserver' in window)) {
                elements.forEach(el => el.classList.add('is-revealed'));
                return;
            }
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const el = entry.target;
                    const delay = el.getAttribute('data-reveal-delay');
                    const once = el.getAttribute('data-reveal-once') !== 'false';
                    if (entry.isIntersecting) {
                        if (delay) el.style.transitionDelay = `${delay}ms`;
                        el.classList.add('is-revealed');
                        if (once) observer.unobserve(el);
                    } else {
                        if (!once) el.classList.remove('is-revealed');
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            elements.forEach(el => observer.observe(el));
        }
    };
    FramePER.ScrollReveal = ScrollReveal;

    // ==========================================
    // BOTTOM SHEET COMPONENT
    // ==========================================
    const BottomSheet = {
        init() {
            document.addEventListener('click', (e) => {
                const trigger = e.target.closest('[data-bottom-sheet-target], [data-open-sheet]');
                if (trigger) {
                    const targetSelector = trigger.getAttribute('data-bottom-sheet-target') || trigger.getAttribute('data-open-sheet') || trigger.getAttribute('href');
                    if (targetSelector && targetSelector.startsWith('#')) {
                        e.preventDefault();
                        BottomSheet.open(targetSelector);
                    }
                }
                const dismiss = e.target.closest('[data-dismiss="sheet"], .bottom-sheet-close');
                if (dismiss) {
                    const sheet = dismiss.closest('.bottom-sheet');
                    if (sheet) BottomSheet.close(sheet);
                }
                if (e.target.classList.contains('bottom-sheet-backdrop')) {
                    const openSheet = document.querySelector('.bottom-sheet.is-open');
                    if (openSheet) BottomSheet.close(openSheet);
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const openSheet = document.querySelector('.bottom-sheet.is-open');
                    if (openSheet) BottomSheet.close(openSheet);
                }
            });

            // Touch swipe to dismiss
            document.querySelectorAll('.bottom-sheet').forEach(sheet => {
                const handle = sheet.querySelector('.bottom-sheet-drag-area') || sheet.querySelector('.bottom-sheet-handle');
                if (!handle) return;
                let startY = 0;
                let currentY = 0;
                handle.addEventListener('touchstart', (e) => {
                    startY = e.touches[0].clientY;
                }, { passive: true });
                handle.addEventListener('touchmove', (e) => {
                    currentY = e.touches[0].clientY;
                    const diff = currentY - startY;
                    if (diff > 0) sheet.style.transform = `translateY(${diff}px)`;
                }, { passive: true });
                handle.addEventListener('touchend', () => {
                    const diff = currentY - startY;
                    sheet.style.transform = '';
                    if (diff > 90) BottomSheet.close(sheet);
                    startY = 0;
                    currentY = 0;
                });
            });
        },
        open(target) {
            const sheet = typeof target === 'string' ? document.querySelector(target) : target;
            if (!sheet) return;
            let backdrop = document.querySelector('.bottom-sheet-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'bottom-sheet-backdrop';
                document.body.appendChild(backdrop);
                backdrop.addEventListener('click', () => BottomSheet.close(sheet));
            }
            backdrop.classList.add('is-open');
            sheet.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            sheet.dispatchEvent(new CustomEvent('sheet:open', { bubbles: true }));
        },
        close(target) {
            const sheet = typeof target === 'string' ? document.querySelector(target) : target;
            if (!sheet) return;
            sheet.classList.remove('is-open');
            const backdrop = document.querySelector('.bottom-sheet-backdrop');
            if (backdrop) backdrop.classList.remove('is-open');
            document.body.style.overflow = '';
            sheet.dispatchEvent(new CustomEvent('sheet:close', { bubbles: true }));
        }
    };
    FramePER.BottomSheet = BottomSheet;

    // ==========================================
    // OTP / PIN INPUT COMPONENT
    // ==========================================
    const OtpInput = {
        init() {
            document.querySelectorAll('[data-otp-input], .otp-input-group').forEach(group => {
                if (group._otpInitialized) return;
                group._otpInitialized = true;
                const inputs = Array.from(group.querySelectorAll('.otp-digit'));
                if (!inputs.length) return;

                inputs.forEach((input, index) => {
                    input.setAttribute('maxlength', '1');
                    input.setAttribute('inputmode', 'numeric');
                    input.setAttribute('autocomplete', 'one-time-code');

                    input.addEventListener('input', () => {
                        const val = input.value.replace(/[^0-9a-zA-Z]/g, '');
                        input.value = val ? val[0] : '';
                        if (val) {
                            input.classList.add('is-filled');
                            if (index < inputs.length - 1) {
                                inputs[index + 1].focus();
                            }
                        } else {
                            input.classList.remove('is-filled');
                        }
                        OtpInput._checkComplete(group, inputs);
                    });

                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Backspace') {
                            if (!input.value && index > 0) {
                                inputs[index - 1].focus();
                                inputs[index - 1].value = '';
                                inputs[index - 1].classList.remove('is-filled');
                            } else {
                                input.value = '';
                                input.classList.remove('is-filled');
                            }
                            OtpInput._checkComplete(group, inputs);
                        } else if (e.key === 'ArrowLeft' && index > 0) {
                            inputs[index - 1].focus();
                        } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                            inputs[index + 1].focus();
                        }
                    });

                    input.addEventListener('paste', (e) => {
                        e.preventDefault();
                        const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
                        const cleanChars = pasteData.replace(/[^0-9a-zA-Z]/g, '').slice(0, inputs.length);
                        cleanChars.split('').forEach((char, i) => {
                            if (inputs[i]) {
                                inputs[i].value = char;
                                inputs[i].classList.add('is-filled');
                            }
                        });
                        const nextIdx = Math.min(cleanChars.length, inputs.length - 1);
                        inputs[nextIdx].focus();
                        OtpInput._checkComplete(group, inputs);
                    });
                });
            });
        },
        _checkComplete(group, inputs) {
            const code = inputs.map(i => i.value).join('');
            if (code.length === inputs.length) {
                group.classList.remove('has-error');
                group.dispatchEvent(new CustomEvent('complete', {
                    detail: { code, length: code.length },
                    bubbles: true
                }));
            }
        },
        getValue(groupSelector) {
            const group = typeof groupSelector === 'string' ? document.querySelector(groupSelector) : groupSelector;
            if (!group) return '';
            return Array.from(group.querySelectorAll('.otp-digit')).map(i => i.value).join('');
        },
        clear(groupSelector) {
            const group = typeof groupSelector === 'string' ? document.querySelector(groupSelector) : groupSelector;
            if (!group) return;
            group.querySelectorAll('.otp-digit').forEach(i => {
                i.value = '';
                i.classList.remove('is-filled');
            });
            group.classList.remove('has-error', 'is-success');
            const first = group.querySelector('.otp-digit');
            if (first) first.focus();
        }
    };
    FramePER.OtpInput = OtpInput;

    // ==========================================
    // CONFETTI CELEBRATION ENGINE
    // ==========================================
    const Confetti = {
        canvas: null,
        ctx: null,
        particles: [],
        animationId: null,

        _getCanvas() {
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.canvas.id = 'frame-confetti-canvas';
                this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999999;';
                document.body.appendChild(this.canvas);
                this.ctx = this.canvas.getContext('2d');
                const resize = () => {
                    if (!this.canvas) return;
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                };
                resize();
                window.addEventListener('resize', resize, { passive: true });
            }
            return { canvas: this.canvas, ctx: this.ctx };
        },

        burst(options = {}) {
            const { canvas } = this._getCanvas();
            const count = options.count || 70;
            const spread = (options.spread || 75) * (Math.PI / 180);
            const baseAngle = options.angle !== undefined ? options.angle : -Math.PI / 2;
            const originX = (options.origin && options.origin.x !== undefined) ? options.origin.x * canvas.width : canvas.width * 0.5;
            const originY = (options.origin && options.origin.y !== undefined) ? options.origin.y * canvas.height : canvas.height * 0.6;
            const colors = options.colors || ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#f43f5e', '#8b5cf6'];
            const minVelocity = options.velocityMin || 8;
            const maxVelocity = options.velocityMax || 22;
            const gravity = options.gravity !== undefined ? options.gravity : 0.38;
            const decay = options.decay !== undefined ? options.decay : 0.01;

            for (let i = 0; i < count; i++) {
                const angle = baseAngle + (Math.random() - 0.5) * spread;
                const velocity = minVelocity + Math.random() * (maxVelocity - minVelocity);
                this.particles.push({
                    x: originX,
                    y: originY,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    size: 6 + Math.random() * 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 14,
                    gravity: gravity,
                    drag: options.drag || 0.96,
                    opacity: 1,
                    decay: decay,
                    shape: Math.random() > 0.4 ? 'rect' : 'circle'
                });
            }

            if (!this.animationId) {
                this._loop();
            }
        },

        rain(options = {}) {
            const duration = options.duration || 3000;
            const startTime = Date.now();
            const interval = setInterval(() => {
                if (Date.now() - startTime >= duration) {
                    clearInterval(interval);
                    return;
                }
                this.burst({
                    count: 14,
                    spread: 50,
                    angle: Math.PI / 2,
                    velocityMin: 2,
                    velocityMax: 6,
                    gravity: 0.16,
                    drag: 0.98,
                    decay: 0.005,
                    origin: { x: Math.random(), y: 0 }
                });
            }, 120);
        },

        cannons(options = {}) {
            const duration = options.duration || 2500;
            const startTime = Date.now();
            const interval = setInterval(() => {
                if (Date.now() - startTime >= duration) {
                    clearInterval(interval);
                    return;
                }
                this.burst({
                    count: 7,
                    angle: -Math.PI / 4,
                    spread: 45,
                    origin: { x: 0, y: 0.85 },
                    velocityMin: 14,
                    velocityMax: 24,
                    gravity: 0.45
                });
                this.burst({
                    count: 7,
                    angle: -3 * Math.PI / 4,
                    spread: 45,
                    origin: { x: 1, y: 0.85 },
                    velocityMin: 14,
                    velocityMax: 24,
                    gravity: 0.45
                });
            }, 100);
        },

        fireworks(options = {}) {
            const bursts = options.bursts || 6;
            for (let i = 0; i < bursts; i++) {
                setTimeout(() => {
                    this.burst({
                        count: 65,
                        spread: 360 * (Math.PI / 180),
                        velocityMin: 4,
                        velocityMax: 16,
                        gravity: 0.22,
                        decay: 0.015,
                        origin: {
                            x: 0.2 + Math.random() * 0.6,
                            y: 0.15 + Math.random() * 0.4
                        }
                    });
                }, i * 350);
            }
        },

        _loop() {
            const { canvas, ctx } = this._getCanvas();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.vx *= p.drag;
                p.vy *= p.drag;
                p.vy += p.gravity;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.opacity -= (p.decay || 0.01);

                if (p.opacity <= 0 || p.y > canvas.height + 30) {
                    this.particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            if (this.particles.length > 0) {
                this.animationId = requestAnimationFrame(() => this._loop());
            } else {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
                if (this.canvas) {
                    this.canvas.remove();
                    this.canvas = null;
                    this.ctx = null;
                }
            }
        },

        init() {
            document.addEventListener('click', (e) => {
                const target = e.target.closest('[data-confetti]');
                if (!target) return;
                const type = target.getAttribute('data-confetti') || 'burst';
                if (type === 'rain') {
                    const dur = parseInt(target.getAttribute('data-confetti-duration'), 10) || 3000;
                    this.rain({ duration: dur });
                } else if (type === 'cannons') {
                    this.cannons();
                } else if (type === 'fireworks') {
                    this.fireworks();
                } else {
                    const count = parseInt(target.getAttribute('data-confetti-count'), 10) || undefined;
                    const rect = target.getBoundingClientRect();
                    const originX = (rect.left + rect.width / 2) / (window.innerWidth || 1);
                    const originY = (rect.top + rect.height / 2) / (window.innerHeight || 1);
                    this.burst({ count, origin: { x: originX, y: originY } });
                }
            });
        }
    };
    FramePER.Confetti = Confetti;

    // ==========================================
    // DATA CONVERTER ENGINE (v2.26)
    // ==========================================
    const Converter = {
        parse(input, options = {}) {
            if (!input) {
                return { headers: [], rows: [], metadata: { totalRows: 0, totalCols: 0 } };
            }
            if (Array.isArray(input)) {
                if (input.length === 0) {
                    return { headers: [], rows: [], metadata: { totalRows: 0, totalCols: 0 } };
                }
                if (Array.isArray(input[0])) {
                    return this._from2DArray(input, options);
                }
                if (typeof input[0] === 'object' && input[0] !== null) {
                    return this._fromArrayOfObjects(input, options);
                }
            }
            if (typeof input === 'string') {
                const trimmed = input.trim();
                if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                    try {
                        return this._parseJSON(trimmed, options);
                    } catch (e) {
                        // fallback se não for JSON válido
                    }
                }
                if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
                    try {
                        return this._parseXML(trimmed, options);
                    } catch (e) {
                        // fallback se não for XML válido
                    }
                }
                return this._parseCSV(trimmed, options);
            }
            if (typeof input === 'object' && input !== null) {
                if (input.headers && Array.isArray(input.rows)) {
                    const parsed = {
                        title: input.title || options.title || 'Dataset',
                        headers: [...input.headers],
                        rows: input.rows.map(r => Array.isArray(r) ? [...r] : Object.values(r)),
                        metadata: {
                            totalRows: input.rows.length,
                            totalCols: input.headers.length,
                            detectedType: 'dataset',
                            ...(input.metadata || {})
                        }
                    };
                    if (input.sheets && typeof input.sheets === 'object') {
                        parsed.sheets = { ...input.sheets };
                        parsed.sheetNames = input.sheetNames ? [...input.sheetNames] : Object.keys(input.sheets);
                        parsed.activeSheet = input.activeSheet || parsed.sheetNames[0];
                    }
                    return parsed;
                }
                return this._fromArrayOfObjects([input], options);
            }
            throw new Error('Formato de entrada não reconhecido pelo FramePER.Converter.');
        },

        normalize(input, options = {}) {
            return this.parse(input, options);
        },

        fromArray(arr, options = {}) {
            return this.parse(arr, options);
        },

        createWorkbook(sheetsInput, options = {}) {
            const sheets = {};
            const sheetNames = [];

            if (Array.isArray(sheetsInput)) {
                sheetsInput.forEach((s, idx) => {
                    const name = s.name || s.title || `Planilha${idx + 1}`;
                    const ds = this.parse(s.dataset || s, { title: name });
                    sheets[name] = ds;
                    sheetNames.push(name);
                });
            } else if (typeof sheetsInput === 'object' && sheetsInput !== null) {
                Object.keys(sheetsInput).forEach(name => {
                    const ds = this.parse(sheetsInput[name], { title: name });
                    sheets[name] = ds;
                    sheetNames.push(name);
                });
            } else {
                throw new Error('createWorkbook espera um objeto de abas ou array de planilhas.');
            }

            if (sheetNames.length === 0) {
                const defaultName = 'Planilha1';
                sheets[defaultName] = this.parse({ headers: [], rows: [] }, { title: defaultName });
                sheetNames.push(defaultName);
            }

            const activeSheet = options.activeSheet || sheetNames[0];
            const activeDs = sheets[activeSheet] || sheets[sheetNames[0]];

            const workbook = {
                title: options.title || activeDs.title || 'Workbook',
                headers: [...activeDs.headers],
                rows: activeDs.rows.map(r => [...r]),
                metadata: { ...(activeDs.metadata || {}), isWorkbook: true },
                sheets,
                sheetNames,
                activeSheet
            };
            return workbook;
        },

        getSheets(dataset) {
            if (!dataset) return {};
            if (dataset.sheets && typeof dataset.sheets === 'object') {
                return dataset.sheets;
            }
            const name = dataset.title || 'Planilha1';
            return { [name]: dataset };
        },

        getSheetNames(dataset) {
            if (!dataset) return [];
            if (dataset.sheetNames && Array.isArray(dataset.sheetNames)) {
                return [...dataset.sheetNames];
            }
            if (dataset.sheets && typeof dataset.sheets === 'object') {
                return Object.keys(dataset.sheets);
            }
            return [dataset.title || 'Planilha1'];
        },

        selectSheet(dataset, sheetNameOrIndex) {
            if (!dataset) return dataset;
            if (!dataset.sheets) {
                const name = dataset.title || 'Planilha1';
                dataset.sheets = { [name]: { ...dataset } };
                dataset.sheetNames = [name];
                dataset.activeSheet = name;
            }

            let targetName;
            if (typeof sheetNameOrIndex === 'number') {
                targetName = dataset.sheetNames[sheetNameOrIndex];
            } else {
                targetName = String(sheetNameOrIndex);
            }

            if (!targetName || !dataset.sheets[targetName]) {
                throw new Error(`Planilha "${sheetNameOrIndex}" não encontrada.`);
            }

            // Sincroniza dados da aba anterior antes de alternar
            if (dataset.activeSheet && dataset.sheets[dataset.activeSheet]) {
                dataset.sheets[dataset.activeSheet].headers = [...dataset.headers];
                dataset.sheets[dataset.activeSheet].rows = dataset.rows.map(r => [...r]);
            }

            dataset.activeSheet = targetName;
            const targetDs = dataset.sheets[targetName];
            dataset.headers = [...targetDs.headers];
            dataset.rows = targetDs.rows.map(r => [...r]);
            dataset.title = targetDs.title || targetName;
            if (dataset.metadata) {
                dataset.metadata.totalRows = dataset.rows.length;
                dataset.metadata.totalCols = dataset.headers.length;
            }
            return dataset;
        },

        addSheet(dataset, name, data = { headers: [], rows: [] }) {
            if (!dataset) throw new Error('Dataset não informado.');
            if (!dataset.sheets) {
                const currentName = dataset.title || 'Planilha1';
                dataset.sheets = { [currentName]: { ...dataset } };
                dataset.sheetNames = [currentName];
                dataset.activeSheet = currentName;
            }

            const cleanName = String(name || `Planilha${dataset.sheetNames.length + 1}`).trim();
            if (dataset.sheets[cleanName]) {
                throw new Error(`Já existe uma planilha com o nome "${cleanName}".`);
            }

            const newDs = this.parse(data, { title: cleanName });
            dataset.sheets[cleanName] = newDs;
            dataset.sheetNames.push(cleanName);
            return dataset;
        },

        removeSheet(dataset, name) {
            if (!dataset || !dataset.sheets) throw new Error('Dataset ou sheets não informado.');
            const sheetName = String(name).trim();
            if (!dataset.sheets[sheetName]) {
                throw new Error(`Planilha "${sheetName}" não encontrada.`);
            }
            if (dataset.sheetNames.length <= 1) {
                throw new Error('Não é possível remover a única planilha restante.');
            }

            delete dataset.sheets[sheetName];
            dataset.sheetNames = dataset.sheetNames.filter(n => n !== sheetName);

            if (dataset.activeSheet === sheetName) {
                this.selectSheet(dataset, dataset.sheetNames[0]);
            }
            return dataset;
        },

        renameSheet(dataset, oldName, newName) {
            if (!dataset || !dataset.sheets) throw new Error('Dataset ou sheets não informado.');
            const from = String(oldName).trim();
            const to = String(newName).trim();
            if (!to) throw new Error('O novo nome da planilha não pode ser vazio.');
            if (from === to) return dataset;
            if (!dataset.sheets[from]) {
                throw new Error(`Planilha "${from}" não encontrada.`);
            }
            if (dataset.sheets[to]) {
                throw new Error(`Já existe uma planilha com o nome "${to}".`);
            }

            const sheetData = dataset.sheets[from];
            sheetData.title = to;
            delete dataset.sheets[from];
            dataset.sheets[to] = sheetData;

            const idx = dataset.sheetNames.indexOf(from);
            if (idx !== -1) {
                dataset.sheetNames[idx] = to;
            }

            if (dataset.activeSheet === from) {
                dataset.activeSheet = to;
                dataset.title = to;
            }
            return dataset;
        },

        _fromArrayOfObjects(arr, options = {}) {
            const headerSet = new Set();
            arr.forEach(obj => {
                if (obj && typeof obj === 'object') {
                    Object.keys(obj).forEach(k => headerSet.add(k));
                }
            });
            const headers = Array.from(headerSet);
            const rows = arr.map(obj => {
                return headers.map(h => (obj && obj[h] !== undefined && obj[h] !== null) ? obj[h] : '');
            });
            return {
                title: options.title || 'Dataset',
                headers,
                rows,
                metadata: {
                    totalRows: rows.length,
                    totalCols: headers.length,
                    detectedType: 'array-of-objects'
                }
            };
        },

        _from2DArray(matrix, options = {}) {
            const headers = (matrix[0] || []).map(h => String(h != null ? h : ''));
            const rows = matrix.slice(1).map(r => Array.isArray(r) ? r : [r]);
            return {
                title: options.title || 'Dataset',
                headers,
                rows,
                metadata: {
                    totalRows: rows.length,
                    totalCols: headers.length,
                    detectedType: '2d-array'
                }
            };
        },

        _parseCSV(text, options = {}) {
            let clean = text;
            if (clean.charCodeAt(0) === 0xFEFF) {
                clean = clean.slice(1);
            }
            let delimiter = options.delimiter;
            if (!delimiter) {
                const firstLine = clean.split(/\r\n|\n|\r/)[0] || '';
                const counts = {
                    ';': (firstLine.match(/;/g) || []).length,
                    ',': (firstLine.match(/,/g) || []).length,
                    '\t': (firstLine.match(/\t/g) || []).length,
                    '|': (firstLine.match(/\|/g) || []).length
                };
                delimiter = Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b, ',');
                if (counts[delimiter] === 0) delimiter = ',';
            }

            const rows = [];
            let currentRow = [];
            let currentField = '';
            let inQuotes = false;

            for (let i = 0; i < clean.length; i++) {
                const c = clean[i];
                const next = clean[i + 1];

                if (inQuotes) {
                    if (c === '"') {
                        if (next === '"') {
                            currentField += '"';
                            i++;
                        } else {
                            inQuotes = false;
                        }
                    } else {
                        currentField += c;
                    }
                } else {
                    if (c === '"') {
                        inQuotes = true;
                    } else if (c === delimiter) {
                        currentRow.push(currentField.trim());
                        currentField = '';
                    } else if (c === '\r') {
                        if (next === '\n') i++;
                        currentRow.push(currentField.trim());
                        if (currentRow.length > 1 || currentRow[0] !== '') {
                            rows.push(currentRow);
                        }
                        currentRow = [];
                        currentField = '';
                    } else if (c === '\n') {
                        currentRow.push(currentField.trim());
                        if (currentRow.length > 1 || currentRow[0] !== '') {
                            rows.push(currentRow);
                        }
                        currentRow = [];
                        currentField = '';
                    } else {
                        currentField += c;
                    }
                }
            }

            if (currentField !== '' || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                if (currentRow.length > 1 || currentRow[0] !== '') {
                    rows.push(currentRow);
                }
            }

            if (rows.length === 0) {
                return { headers: [], rows: [], metadata: { totalRows: 0, totalCols: 0, detectedType: 'csv' } };
            }

            const rawHeaders = rows[0].map(h => String(h || '').trim());
            const dataRows = rows.slice(1).map(r => {
                const row = [...r];
                while (row.length < rawHeaders.length) row.push('');
                return row.map(val => {
                    if (val === '') return '';
                    const num = Number(val);
                    return (!isNaN(num) && !isNaN(parseFloat(val)) && String(num) === val.trim()) ? num : val;
                });
            });

            return {
                title: options.title || 'Dados CSV',
                headers: rawHeaders,
                rows: dataRows,
                metadata: {
                    totalRows: dataRows.length,
                    totalCols: rawHeaders.length,
                    delimiter,
                    detectedType: 'csv'
                }
            };
        },

        _parseJSON(text, options = {}) {
            const data = JSON.parse(text);
            const dataset = this.parse(data, options);
            dataset.metadata.detectedType = 'json';
            return dataset;
        },

        _parseXML(text, options = {}) {
            let headers = [];
            let rows = [];

            if (typeof DOMParser !== 'undefined') {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'application/xml');
                const root = doc.documentElement;
                if (root && root.children && root.children.length > 0) {
                    const headerSet = new Set();
                    const records = Array.from(root.children);
                    records.forEach(rec => {
                        Array.from(rec.children).forEach(child => headerSet.add(child.tagName));
                    });
                    headers = Array.from(headerSet);
                    rows = records.map(rec => {
                        return headers.map(h => {
                            const child = rec.querySelector(h);
                            return child ? child.textContent.trim() : '';
                        });
                    });
                }
            }

            // Fallback para Node.js ou caso DOMParser retorne vazio
            if (headers.length === 0) {
                const cleanXml = text.replace(/<\?xml[\s\S]*?\?>/i, '').trim();
                const rootMatch = cleanXml.match(/<([a-zA-Z0-9_\-]+)[^>]*>([\s\S]*?)<\/\1>/);
                const inner = rootMatch ? rootMatch[2].trim() : cleanXml;
                
                const recordMatches = inner.match(/<([a-zA-Z0-9_\-]+)[^>]*>([\s\S]*?)<\/\1>/g);
                if (recordMatches) {
                    const headerSet = new Set();
                    const parsedRecords = [];
                    recordMatches.forEach(recStr => {
                        const recInnerMatch = recStr.match(/<([a-zA-Z0-9_\-]+)[^>]*>([\s\S]*?)<\/\1>/);
                        const recBody = recInnerMatch ? recInnerMatch[2] : recStr;
                        const fieldMatches = Array.from(recBody.matchAll(/<([a-zA-Z0-9_\-]+)[^>]*>([^<]*)<\/\1>/g));
                        if (fieldMatches.length > 0) {
                            const recObj = {};
                            fieldMatches.forEach(m => {
                                headerSet.add(m[1]);
                                recObj[m[1]] = m[2].trim();
                            });
                            parsedRecords.push(recObj);
                        }
                    });
                    headers = Array.from(headerSet);
                    rows = parsedRecords.map(obj => headers.map(h => obj[h] !== undefined ? obj[h] : ''));
                }
            }

            return {
                title: options.title || 'Dados XML',
                headers,
                rows,
                metadata: {
                    totalRows: rows.length,
                    totalCols: headers.length,
                    detectedType: 'xml'
                }
            };
        },

        toCSV(dataset, options = {}) {
            const ds = this.parse(dataset, options);
            const delimiter = options.delimiter || ',';
            const escapeCSV = (val) => {
                if (val === null || val === undefined) return '';
                const str = String(val);
                if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            };

            const bom = options.bom !== false ? '\uFEFF' : '';
            const headerLine = ds.headers.map(escapeCSV).join(delimiter);
            const rowLines = ds.rows.map(r => r.map(escapeCSV).join(delimiter));
            return bom + [headerLine, ...rowLines].join('\r\n');
        },

        toJSON(dataset, options = {}) {
            const ds = this.parse(dataset, options);
            if (options.as2DArray) {
                return JSON.stringify([ds.headers, ...ds.rows], null, options.indent !== undefined ? options.indent : 2);
            }
            const arr = ds.rows.map(r => {
                const obj = {};
                ds.headers.forEach((h, idx) => {
                    obj[h] = r[idx] !== undefined ? r[idx] : null;
                });
                return obj;
            });
            return JSON.stringify(arr, null, options.indent !== undefined ? options.indent : 2);
        },

        toXML(dataset, options = {}) {
            const ds = this.parse(dataset, options);
            const rootTag = options.rootTag || 'dataset';
            const recordTag = options.recordTag || 'record';

            const sanitizeTag = (t) => {
                let clean = String(t || 'campo').replace(/[^a-zA-Z0-9_\-]/g, '_');
                if (/^[0-9\-]/.test(clean)) clean = '_' + clean;
                return clean || 'campo';
            };

            const escapeXML = (val) => {
                if (val === null || val === undefined) return '';
                return String(val)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
            };

            const lines = ['<?xml version="1.0" encoding="UTF-8"?>', `<${rootTag}>`];
            ds.rows.forEach(r => {
                lines.push(`  <${recordTag}>`);
                ds.headers.forEach((h, idx) => {
                    const tag = sanitizeTag(h);
                    lines.push(`    <${tag}>${escapeXML(r[idx])}</${tag}>`);
                });
                lines.push(`  </${recordTag}>`);
            });
            lines.push(`</${rootTag}>`);
            return lines.join('\n');
        },

        toXLS(dataset, options = {}) {
            let sheetsMap = {};
            let sheetNamesList = [];

            if (dataset && dataset.sheets && typeof dataset.sheets === 'object') {
                sheetsMap = dataset.sheets;
                sheetNamesList = dataset.sheetNames || Object.keys(sheetsMap);
            } else if (options.sheets && typeof options.sheets === 'object') {
                sheetsMap = options.sheets;
                sheetNamesList = Object.keys(sheetsMap);
            } else {
                const ds = this.parse(dataset, options);
                const sName = options.sheetName || ds.title || 'Planilha1';
                sheetsMap = { [sName]: ds };
                sheetNamesList = [sName];
            }

            if (sheetNamesList.length === 0) {
                sheetNamesList = ['Planilha1'];
                sheetsMap['Planilha1'] = this.parse({ headers: [], rows: [] });
            }

            const escapeXML = (val) => {
                if (val === null || val === undefined) return '';
                return String(val)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
            };

            const worksheetsXML = sheetNamesList.map(name => {
                const sDs = this.parse(sheetsMap[name]);
                const headerCells = sDs.headers.map(h => {
                    return `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`;
                }).join('');

                const dataRows = sDs.rows.map((r, rIdx) => {
                    const styleAttr = rIdx % 2 === 1 ? ' ss:StyleID="Zebra"' : '';
                    const cells = r.map(val => {
                        if (val === null || val === undefined || val === '') {
                            return '<Cell><Data ss:Type="String"></Data></Cell>';
                        }
                        const num = Number(val);
                        if (typeof val === 'number' || (!isNaN(num) && !isNaN(parseFloat(val)) && String(num) === String(val).trim())) {
                            return `<Cell${styleAttr}><Data ss:Type="Number">${num}</Data></Cell>`;
                        }
                        return `<Cell${styleAttr}><Data ss:Type="String">${escapeXML(val)}</Data></Cell>`;
                    }).join('');
                    return `   <Row ss:Height="20">\n    ${cells}\n   </Row>`;
                }).join('\n');

                return ` <Worksheet ss:Name="${escapeXML(name)}">
  <Table ss:DefaultColumnWidth="100">
   <Row ss:Height="26">
    ${headerCells}
   </Row>
${dataRows}
  </Table>
 </Worksheet>`;
            }).join('\n');

            const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Zebra">
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
 </Styles>
${worksheetsXML}
</Workbook>`;

            if (options.asBlob && typeof Blob !== 'undefined') {
                return new Blob([xml], { type: 'application/vnd.ms-excel' });
            }
            return xml;
        },

        _crc32(bytes) {
            let table = Converter._crcTable;
            if (!table) {
                table = new Uint32Array(256);
                for (let i = 0; i < 256; i++) {
                    let c = i;
                    for (let k = 0; k < 8; k++) {
                        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
                    }
                    table[i] = c >>> 0;
                }
                Converter._crcTable = table;
            }
            const arr = (typeof bytes === 'string') ? new TextEncoder().encode(bytes) : bytes;
            let crc = 0 ^ (-1);
            for (let i = 0; i < arr.length; i++) {
                crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xFF];
            }
            return (crc ^ (-1)) >>> 0;
        },

        _createZip(files) {
            const encoder = new TextEncoder();
            const normalizedFiles = files.map(f => {
                const nameBytes = encoder.encode(f.name);
                const dataBytes = (typeof f.data === 'string') ? encoder.encode(f.data) : (f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data));
                const crc = this._crc32(dataBytes);
                return { nameBytes, dataBytes, crc };
            });

            let totalLocalHeadersSize = 0;
            let totalDataSize = 0;
            let totalCdSize = 0;

            normalizedFiles.forEach(f => {
                totalLocalHeadersSize += 30 + f.nameBytes.length;
                totalDataSize += f.dataBytes.length;
                totalCdSize += 46 + f.nameBytes.length;
            });

            const totalSize = totalLocalHeadersSize + totalDataSize + totalCdSize + 22;
            const buffer = new ArrayBuffer(totalSize);
            const view = new DataView(buffer);
            const uint8 = new Uint8Array(buffer);

            let offset = 0;
            const localOffsets = [];

            // 1. Write Local File Headers + File Data
            normalizedFiles.forEach(f => {
                localOffsets.push(offset);
                view.setUint32(offset, 0x04034b50, true);
                view.setUint16(offset + 4, 20, true);
                view.setUint16(offset + 6, 0x0800, true);
                view.setUint16(offset + 8, 0, true);
                view.setUint16(offset + 10, 0, true);
                view.setUint16(offset + 12, 0, true);
                view.setUint32(offset + 14, f.crc, true);
                view.setUint32(offset + 18, f.dataBytes.length, true);
                view.setUint32(offset + 22, f.dataBytes.length, true);
                view.setUint16(offset + 26, f.nameBytes.length, true);
                view.setUint16(offset + 28, 0, true);
                offset += 30;

                uint8.set(f.nameBytes, offset);
                offset += f.nameBytes.length;

                uint8.set(f.dataBytes, offset);
                offset += f.dataBytes.length;
            });

            // 2. Write Central Directory
            const cdOffset = offset;
            normalizedFiles.forEach((f, idx) => {
                view.setUint32(offset, 0x02014b50, true);
                view.setUint16(offset + 4, 0x0314, true);
                view.setUint16(offset + 6, 20, true);
                view.setUint16(offset + 8, 0x0800, true);
                view.setUint16(offset + 10, 0, true);
                view.setUint16(offset + 12, 0, true);
                view.setUint16(offset + 14, 0, true);
                view.setUint32(offset + 16, f.crc, true);
                view.setUint32(offset + 20, f.dataBytes.length, true);
                view.setUint32(offset + 24, f.dataBytes.length, true);
                view.setUint16(offset + 28, f.nameBytes.length, true);
                view.setUint16(offset + 30, 0, true);
                view.setUint16(offset + 32, 0, true);
                view.setUint16(offset + 34, 0, true);
                view.setUint16(offset + 36, 0, true);
                view.setUint32(offset + 38, 0x81A40000, true);
                view.setUint32(offset + 42, localOffsets[idx], true);
                offset += 46;

                uint8.set(f.nameBytes, offset);
                offset += f.nameBytes.length;
            });
            const cdSize = offset - cdOffset;

            // 3. Write End of Central Directory Record (EOCD)
            view.setUint32(offset, 0x06054b50, true);
            view.setUint16(offset + 4, 0, true);
            view.setUint16(offset + 6, 0, true);
            view.setUint16(offset + 8, normalizedFiles.length, true);
            view.setUint16(offset + 10, normalizedFiles.length, true);
            view.setUint32(offset + 12, cdSize, true);
            view.setUint32(offset + 16, cdOffset, true);
            view.setUint16(offset + 20, 0, true);

            return uint8;
        },

        _parseCellRef(ref) {
            if (!ref || typeof ref !== 'string') return { col: 0, row: 0 };
            const match = ref.match(/^([A-Z]+)(\d+)$/i);
            if (!match) return { col: 0, row: 0 };
            const letters = match[1].toUpperCase();
            const digits = match[2];
            let col = 0;
            for (let i = 0; i < letters.length; i++) {
                col = col * 26 + (letters.charCodeAt(i) - 64);
            }
            col -= 1;
            const row = Math.max(0, parseInt(digits, 10) - 1);
            return { col, row };
        },

        _unescapeXML(str) {
            if (!str) return '';
            return String(str)
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
                .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        },

        async _readZip(buffer) {
            let bytes;
            if (buffer instanceof Uint8Array) {
                bytes = buffer;
            } else if (buffer instanceof ArrayBuffer) {
                bytes = new Uint8Array(buffer);
            } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(buffer)) {
                bytes = new Uint8Array(buffer);
            } else {
                throw new Error('Buffer inválido para descompactação ZIP.');
            }

            const decompress = async (compBytes, method) => {
                if (method === 0) {
                    return compBytes;
                }
                if (method === 8) {
                    if (typeof DecompressionStream !== 'undefined') {
                        try {
                            const ds = new DecompressionStream('deflate-raw');
                            const writer = ds.writable.getWriter();
                            writer.write(compBytes);
                            writer.close();
                            const res = new Response(ds.readable);
                            const ab = await res.arrayBuffer();
                            return new Uint8Array(ab);
                        } catch (e) {}
                    }
                    if (typeof require !== 'undefined') {
                        try {
                            const zlib = require('zlib');
                            return new Uint8Array(zlib.inflateRawSync(compBytes));
                        } catch (e) {}
                    }
                    throw new Error('Descompressão Deflate requer suporte a DecompressionStream ou zlib.');
                }
                throw new Error(`Método de compressão ZIP ${method} não suportado.`);
            };

            const files = {};

            let eocdOffset = -1;
            for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
                if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
                    eocdOffset = i;
                    break;
                }
            }

            if (eocdOffset !== -1) {
                const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                const totalEntries = view.getUint16(eocdOffset + 10, true);
                const cdOffset = view.getUint32(eocdOffset + 16, true);
                let pos = cdOffset;

                for (let i = 0; i < totalEntries && pos + 46 <= bytes.length; i++) {
                    const sig = view.getUint32(pos, true);
                    if (sig !== 0x02014b50) break;

                    const method = view.getUint16(pos + 10, true);
                    const compSize = view.getUint32(pos + 20, true);
                    const fnLen = view.getUint16(pos + 28, true);
                    const extraLen = view.getUint16(pos + 30, true);
                    const commentLen = view.getUint16(pos + 32, true);
                    const lhOffset = view.getUint32(pos + 42, true);

                    const fnBytes = bytes.subarray(pos + 46, pos + 46 + fnLen);
                    const filename = new TextDecoder('utf-8', { fatal: false }).decode(fnBytes);
                    pos += 46 + fnLen + extraLen + commentLen;

                    if (lhOffset + 30 <= bytes.length) {
                        const lhSig = view.getUint32(lhOffset, true);
                        if (lhSig === 0x04034b50) {
                            const lhFnLen = view.getUint16(lhOffset + 26, true);
                            const lhExtraLen = view.getUint16(lhOffset + 28, true);
                            const dataOffset = lhOffset + 30 + lhFnLen + lhExtraLen;
                            const compData = bytes.subarray(dataOffset, dataOffset + compSize);
                            const decompData = await decompress(compData, method);
                            files[filename] = new TextDecoder('utf-8', { fatal: false }).decode(decompData);
                        }
                    }
                }
            } else {
                let pos = 0;
                const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                while (pos + 30 <= bytes.length) {
                    const sig = view.getUint32(pos, true);
                    if (sig !== 0x04034b50) break;

                    const method = view.getUint16(pos + 8, true);
                    const compSize = view.getUint32(pos + 18, true);
                    const fnLen = view.getUint16(pos + 26, true);
                    const extraLen = view.getUint16(pos + 28, true);

                    const filename = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(pos + 30, pos + 30 + fnLen));
                    const dataOffset = pos + 30 + fnLen + extraLen;
                    const compData = bytes.subarray(dataOffset, dataOffset + compSize);

                    const decompData = await decompress(compData, method);
                    files[filename] = new TextDecoder('utf-8', { fatal: false }).decode(decompData);

                    pos = dataOffset + compSize;
                }
            }

            return files;
        },

        async fromXLSX(buffer, options = {}) {
            const files = await this._readZip(buffer);

            // 1. Shared Strings (xl/sharedStrings.xml)
            const sharedStrings = [];
            const ssKey = Object.keys(files).find(k => k.toLowerCase() === 'xl/sharedstrings.xml');
            if (ssKey && files[ssKey]) {
                const ssXML = files[ssKey];
                const siMatches = ssXML.match(/<si[\s\S]*?<\/si>/gi) || [];
                siMatches.forEach(si => {
                    const tMatches = si.match(/<t[\s\S]*?>([\s\S]*?)<\/t>/gi) || [];
                    let val = '';
                    tMatches.forEach(tTag => {
                        val += tTag.replace(/^<t[^>]*>/i, '').replace(/<\/t>$/i, '');
                    });
                    sharedStrings.push(this._unescapeXML(val));
                });
            }

            // 2. Discover worksheets from xl/workbook.xml and xl/_rels/workbook.xml.rels
            const sheetsInfo = [];
            const wbKey = Object.keys(files).find(k => k.toLowerCase() === 'xl/workbook.xml');
            const wbRelsKey = Object.keys(files).find(k => k.toLowerCase() === 'xl/_rels/workbook.xml.rels');

            if (wbKey && files[wbKey]) {
                const wbXML = files[wbKey];
                const relsMap = {};
                if (wbRelsKey && files[wbRelsKey]) {
                    const relMatches = files[wbRelsKey].match(/<Relationship[\s\S]*?\/>/gi) || [];
                    relMatches.forEach(relTag => {
                        const idMatch = relTag.match(/Id="([^"]+)"/i);
                        const targetMatch = relTag.match(/Target="([^"]+)"/i);
                        if (idMatch && targetMatch) {
                            let target = targetMatch[1].replace(/\\/g, '/');
                            if (!target.toLowerCase().startsWith('xl/')) {
                                target = 'xl/' + target.replace(/^\.\//, '');
                            }
                            relsMap[idMatch[1]] = target;
                        }
                    });
                }

                const sheetTags = wbXML.match(/<sheet[\s\S]*?\/>/gi) || [];
                sheetTags.forEach((sTag, idx) => {
                    const nameMatch = sTag.match(/name="([^"]+)"/i);
                    const sheetIdMatch = sTag.match(/sheetId="([^"]+)"/i);
                    const rIdMatch = sTag.match(/r:id="([^"]+)"/i);

                    const sName = nameMatch ? this._unescapeXML(nameMatch[1]) : `Planilha${idx + 1}`;
                    const sheetId = sheetIdMatch ? sheetIdMatch[1] : String(idx + 1);
                    const rId = rIdMatch ? rIdMatch[1] : null;

                    let filePath = rId && relsMap[rId] ? relsMap[rId] : null;
                    if (!filePath) {
                        filePath = `xl/worksheets/sheet${sheetId}.xml`;
                    }
                    sheetsInfo.push({ name: sName, sheetId, rId, path: filePath });
                });
            }

            // Fallback se workbook.xml não definiu as sheets
            if (sheetsInfo.length === 0) {
                const sheetKeys = Object.keys(files).filter(k => k.toLowerCase().startsWith('xl/worksheets/') && k.toLowerCase().endsWith('.xml'));
                sheetKeys.sort().forEach((k, idx) => {
                    sheetsInfo.push({ name: `Planilha${idx + 1}`, sheetId: String(idx + 1), path: k });
                });
            }

            if (sheetsInfo.length === 0) {
                throw new Error('Nenhuma planilha encontrada no arquivo .xlsx.');
            }

            const parsedSheets = {};
            const sheetNames = [];

            sheetsInfo.forEach(sInfo => {
                const sheetKey = Object.keys(files).find(k => k.toLowerCase() === sInfo.path.toLowerCase()) ||
                                 Object.keys(files).find(k => k.toLowerCase().endsWith('/' + sInfo.path.toLowerCase().split('/').pop()));
                if (!sheetKey || !files[sheetKey]) return;

                const sheetXML = files[sheetKey];
                const grid = [];
                let maxCol = 0;
                const rowMatches = sheetXML.match(/<row[\s\S]*?<\/row>/gi) || [];

                rowMatches.forEach((rowTag, autoRowIdx) => {
                    const rAttrMatch = rowTag.match(/<row[^>]*\sr="(\d+)"/i);
                    const rowIdx = rAttrMatch ? parseInt(rAttrMatch[1], 10) - 1 : autoRowIdx;

                    if (!grid[rowIdx]) grid[rowIdx] = [];

                    const cellMatches = rowTag.match(/<c[\s\S]*?(?:<\/c>|\/>)/gi) || [];
                    let autoColIdx = 0;

                    cellMatches.forEach(cTag => {
                        const rRefMatch = cTag.match(/r="([A-Z]+[0-9]+)"/i);
                        let colIdx;
                        if (rRefMatch) {
                            const coords = this._parseCellRef(rRefMatch[1]);
                            colIdx = coords.col;
                        } else {
                            colIdx = autoColIdx;
                        }
                        autoColIdx = colIdx + 1;
                        if (colIdx > maxCol) maxCol = colIdx;

                        const tMatch = cTag.match(/\st="([^"]+)"/i);
                        const cellType = tMatch ? tMatch[1] : '';

                        let val = '';
                        if (cellType === 'inlineStr') {
                            const isMatch = cTag.match(/<is>[\s\S]*?<t[\s\S]*?>([\s\S]*?)<\/t>/i);
                            if (isMatch) val = this._unescapeXML(isMatch[1]);
                        } else if (cellType === 's') {
                            const vMatch = cTag.match(/<v>([\s\S]*?)<\/v>/i);
                            if (vMatch) {
                                const idx = parseInt(vMatch[1].trim(), 10);
                                val = (sharedStrings[idx] !== undefined) ? sharedStrings[idx] : '';
                            }
                        } else if (cellType === 'b') {
                            const vMatch = cTag.match(/<v>([\s\S]*?)<\/v>/i);
                            val = vMatch && vMatch[1].trim() === '1';
                        } else {
                            const vMatch = cTag.match(/<v>([\s\S]*?)<\/v>/i);
                            if (vMatch) {
                                const rawVal = vMatch[1].trim();
                                const num = Number(rawVal);
                                if (!isNaN(num) && rawVal !== '') {
                                    val = num;
                                } else {
                                    val = this._unescapeXML(rawVal);
                                }
                            }
                        }

                        grid[rowIdx][colIdx] = val;
                    });
                });

                // Clean grid into rectangular 2D array
                const cleanGrid = [];
                const totalCols = maxCol + 1;
                for (let r = 0; r < grid.length; r++) {
                    if (!grid[r]) continue;
                    const row = [];
                    for (let c = 0; c < totalCols; c++) {
                        const cellVal = grid[r][c];
                        row.push(cellVal !== undefined ? cellVal : '');
                    }
                    cleanGrid.push(row);
                }

                let headers = [];
                let rows = [];
                if (cleanGrid.length > 0) {
                    headers = cleanGrid[0].map(h => String(h != null ? h : ''));
                    rows = cleanGrid.slice(1);
                }

                const sDs = this.parse({
                    title: sInfo.name,
                    headers,
                    rows
                }, options);
                if (sDs.metadata) sDs.metadata.detectedType = 'xlsx';

                parsedSheets[sInfo.name] = sDs;
                sheetNames.push(sInfo.name);
            });

            if (sheetNames.length === 0) {
                const emptyDs = this.parse({ title: options.title || 'Planilha Vazia', headers: [], rows: [] }, options);
                return emptyDs;
            }

            let activeName = sheetNames[0];
            if (options.sheetName && parsedSheets[options.sheetName]) {
                activeName = options.sheetName;
            } else if (typeof options.sheetIndex === 'number' && sheetNames[options.sheetIndex]) {
                activeName = sheetNames[options.sheetIndex];
            }

            const activeDs = parsedSheets[activeName];
            const result = {
                title: options.title || activeDs.title || activeName,
                headers: [...activeDs.headers],
                rows: activeDs.rows.map(r => [...r]),
                metadata: {
                    ...(activeDs.metadata || {}),
                    detectedType: 'xlsx',
                    isWorkbook: sheetNames.length > 1
                },
                sheets: parsedSheets,
                sheetNames: [...sheetNames],
                activeSheet: activeName
            };
            return result;
        },

        toXLSX(dataset, options = {}) {
            let sheetsMap = {};
            let sheetNamesList = [];

            if (dataset && dataset.sheets && typeof dataset.sheets === 'object') {
                sheetsMap = dataset.sheets;
                sheetNamesList = dataset.sheetNames || Object.keys(sheetsMap);
            } else if (options.sheets && typeof options.sheets === 'object') {
                sheetsMap = options.sheets;
                sheetNamesList = Object.keys(sheetsMap);
            } else {
                const ds = this.parse(dataset, options);
                const singleName = options.sheetName || ds.title || 'Planilha1';
                sheetsMap = { [singleName]: ds };
                sheetNamesList = [singleName];
            }

            if (sheetNamesList.length === 0) {
                sheetNamesList = ['Planilha1'];
                sheetsMap['Planilha1'] = this.parse({ headers: [], rows: [] });
            }

            const colName = (index) => {
                let name = '';
                let num = index;
                while (num >= 0) {
                    name = String.fromCharCode((num % 26) + 65) + name;
                    num = Math.floor(num / 26) - 1;
                }
                return name;
            };

            const escapeXML = (val) => {
                if (val === null || val === undefined) return '';
                return String(val)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
            };

            const sheetFiles = [];
            const sheetOverrides = [];
            const workbookSheetTags = [];
            const workbookRelTags = [];

            sheetNamesList.forEach((sName, sIdx) => {
                const sheetId = sIdx + 1;
                const rId = `rId${sheetId}`;
                const rawDs = sheetsMap[sName];
                const sheetDs = this.parse(rawDs);

                const rowsXML = [];
                const headerCells = sheetDs.headers.map((h, idx) => {
                    const ref = colName(idx) + '1';
                    return `<c r="${ref}" t="inlineStr" s="1"><is><t>${escapeXML(h)}</t></is></c>`;
                }).join('');
                rowsXML.push(`<row r="1">${headerCells}</row>`);

                sheetDs.rows.forEach((r, rIdx) => {
                    const rowNum = rIdx + 2;
                    const styleId = (rIdx % 2 === 1) ? '2' : '0';
                    const cells = r.map((val, cIdx) => {
                        const ref = colName(cIdx) + rowNum;
                        if (val === null || val === undefined || val === '') {
                            return `<c r="${ref}" s="${styleId}"/>`;
                        }
                        const num = Number(val);
                        if (typeof val === 'number' || (!isNaN(num) && !isNaN(parseFloat(val)) && String(num) === String(val).trim())) {
                            return `<c r="${ref}" t="n" s="${styleId}"><v>${num}</v></c>`;
                        }
                        return `<c r="${ref}" t="inlineStr" s="${styleId}"><is><t>${escapeXML(val)}</t></is></c>`;
                    }).join('');
                    rowsXML.push(`<row r="${rowNum}">${cells}</row>`);
                });

                const sheetXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${rowsXML.join('\n    ')}
  </sheetData>
</worksheet>`;

                sheetFiles.push({ name: `xl/worksheets/sheet${sheetId}.xml`, data: sheetXML });
                sheetOverrides.push(`<Override PartName="/xl/worksheets/sheet${sheetId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`);
                workbookSheetTags.push(`<sheet name="${escapeXML(sName)}" sheetId="${sheetId}" r:id="${rId}"/>`);
                workbookRelTags.push(`<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetId}.xml"/>`);
            });

            const stylesRelId = `rId${sheetNamesList.length + 1}`;
            workbookRelTags.push(`<Relationship Id="${stylesRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`);

            const contentTypesXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${sheetOverrides.join('\n  ')}
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

            const rootRelsXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

            const workbookXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${workbookSheetTags.join('\n    ')}
  </sheets>
</workbook>`;

            const workbookRelsXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookRelTags.join('\n  ')}
</Relationships>`;

            const stylesXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><name val="Calibri"/><sz val="11"/><color rgb="000000"/></font>
    <font><b/><name val="Calibri"/><sz val="11"/><color rgb="FFFFFF"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF2563EB"/></patternFill></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="0" fillId="1" borderId="0"/>
  </cellXfs>
</styleSheet>`;

            const files = [
                { name: '[Content_Types].xml', data: contentTypesXML },
                { name: '_rels/.rels', data: rootRelsXML },
                { name: 'xl/workbook.xml', data: workbookXML },
                { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXML },
                { name: 'xl/styles.xml', data: stylesXML },
                ...sheetFiles
            ];

            const zipBytes = this._createZip(files);
            if (options.asBuffer || options.raw) {
                return zipBytes;
            }
            if (typeof Blob !== 'undefined') {
                return new Blob([zipBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            }
            return zipBytes;
        },

        toPDF(dataset, options = {}) {
            const ds = this.parse(dataset, options);
            const title = options.title || ds.title || 'Relatório de Dados';
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR');

            const pageWidth = 595.28;
            const pageHeight = 841.89;
            const marginLeft = 36;
            const marginRight = 36;
            const marginTop = 36;
            const marginBottom = 36;
            const contentWidth = pageWidth - marginLeft - marginRight;
            const colHeaderHeight = 22;
            const rowHeight = 18;

            // Normalize and escape text for PDF syntax
            const escapePDF = (str) => {
                if (str === null || str === undefined) return '';
                // Transliterate accented characters to safe latin characters for Helvetica standard type1 font
                const map = {
                    'á':'a','à':'a','ã':'a','â':'a','ä':'a','é':'e','è':'e','ê':'e','ë':'e',
                    'í':'i','ì':'i','î':'i','ï':'i','ó':'o','ò':'o','õ':'o','ô':'o','ö':'o',
                    'ú':'u','ù':'u','û':'u','ü':'u','ç':'c','ñ':'n','Á':'A','À':'A','Ã':'A',
                    'Â':'A','Ä':'A','É':'E','È':'E','Ê':'E','Ë':'E','Í':'I','Ì':'I','Î':'I',
                    'Ï':'I','Ó':'O','Ò':'O','Õ':'O','Ô':'O','Ö':'O','Ú':'U','Ù':'U','Û':'U',
                    'Ü':'U','Ç':'C','Ñ':'N'
                };
                let clean = String(str).replace(/[^\u0000-\u007E]/g, ch => map[ch] || ch);
                return clean
                    .replace(/\\/g, '\\\\')
                    .replace(/\(/g, '\\(')
                    .replace(/\)/g, '\\)')
                    .replace(/[\r\n]+/g, ' ')
                    .slice(0, 75);
            };

            // Calculate proportional column widths
            const colWeights = ds.headers.map((h, cIdx) => {
                let maxL = String(h).length;
                ds.rows.forEach(r => {
                    const l = String(r[cIdx] || '').length;
                    if (l > maxL) maxL = l;
                });
                return Math.max(6, Math.min(32, maxL));
            });
            const totalWeight = colWeights.reduce((a, b) => a + b, 0) || 1;
            const colWidths = colWeights.map(w => (w / totalWeight) * contentWidth);

            // Chunk rows into pages
            const rowsPage1 = 34; // leaves room for title block
            const rowsPageN = 38;
            const pageChunks = [];

            if (ds.rows.length <= rowsPage1) {
                pageChunks.push(ds.rows);
            } else {
                pageChunks.push(ds.rows.slice(0, rowsPage1));
                let curIdx = rowsPage1;
                while (curIdx < ds.rows.length) {
                    pageChunks.push(ds.rows.slice(curIdx, curIdx + rowsPageN));
                    curIdx += rowsPageN;
                }
            }

            const totalPages = pageChunks.length;
            const pageContents = [];

            let globalRowCounter = 0;
            pageChunks.forEach((chunk, pageIdx) => {
                const pageNum = pageIdx + 1;
                let stream = '';

                let tableTopY;
                if (pageIdx === 0) {
                    // Header Block (Page 1 only)
                    // Accent bar
                    stream += `0.145 0.388 0.922 rg ${marginLeft} ${pageHeight - marginTop - 4} ${contentWidth} 4 re f\n`;
                    // Title
                    stream += `BT /F2 15 Tf 0.1 0.1 0.1 rg ${marginLeft} ${pageHeight - marginTop - 22} Td (${escapePDF(title)}) Tj ET\n`;
                    // Subtitle / Date
                    stream += `BT /F1 8 Tf 0.45 0.45 0.45 rg ${marginLeft} ${pageHeight - marginTop - 34} Td (Gerado em ${escapePDF(dateStr)} - FramePER UI Framework) Tj ET\n`;
                    tableTopY = pageHeight - marginTop - 48;
                } else {
                    // Subsequent pages header
                    stream += `BT /F2 9 Tf 0.4 0.4 0.4 rg ${marginLeft} ${pageHeight - marginTop - 12} Td (${escapePDF(title)} - Continuação) Tj ET\n`;
                    stream += `0.85 0.88 0.92 RG 0.5 w ${marginLeft} ${pageHeight - marginTop - 16} m ${pageWidth - marginRight} ${pageHeight - marginTop - 16} l S\n`;
                    tableTopY = pageHeight - marginTop - 24;
                }

                // Table Header background
                stream += `0.145 0.388 0.922 rg ${marginLeft} ${tableTopY - colHeaderHeight} ${contentWidth} ${colHeaderHeight} re f\n`;

                // Table Header text
                let curX = marginLeft;
                ds.headers.forEach((h, cIdx) => {
                    const w = colWidths[cIdx];
                    stream += `BT /F2 8.5 Tf 1 1 1 rg ${curX + 4} ${tableTopY - colHeaderHeight + 7} Td (${escapePDF(h)}) Tj ET\n`;
                    curX += w;
                });

                // Table Data Rows
                chunk.forEach((row, rIdx) => {
                    const rowY = tableTopY - colHeaderHeight - (rIdx + 1) * rowHeight;
                    // Zebra stripe
                    if (globalRowCounter % 2 === 1) {
                        stream += `0.973 0.980 0.988 rg ${marginLeft} ${rowY} ${contentWidth} ${rowHeight} re f\n`;
                    }
                    // Bottom border
                    stream += `0.88 0.90 0.93 RG 0.5 w ${marginLeft} ${rowY} m ${pageWidth - marginRight} ${rowY} l S\n`;

                    // Cell contents
                    curX = marginLeft;
                    row.forEach((val, cIdx) => {
                        const w = colWidths[cIdx];
                        stream += `BT /F1 7.5 Tf 0.15 0.15 0.15 rg ${curX + 4} ${rowY + 5.5} Td (${escapePDF(val)}) Tj ET\n`;
                        curX += w;
                    });

                    globalRowCounter++;
                });

                // Footer
                stream += `0.85 0.88 0.92 RG 0.5 w ${marginLeft} ${marginBottom + 12} m ${pageWidth - marginRight} ${marginBottom + 12} l S\n`;
                stream += `BT /F1 7.5 Tf 0.45 0.45 0.45 rg ${marginLeft} ${marginBottom + 2} Td (FramePER - Conversor Universal) Tj ET\n`;
                stream += `BT /F1 7.5 Tf 0.45 0.45 0.45 rg ${pageWidth - marginRight - 65} ${marginBottom + 2} Td (Página ${pageNum} de ${totalPages}) Tj ET\n`;

                pageContents.push(stream);
            });

            // Assemble PDF 1.4 objects
            const objects = [];
            const addObject = (content) => {
                objects.push(content);
                return objects.length;
            };

            // Obj 1: Catalog
            addObject(`<< /Type /Catalog /Pages 2 0 R >>`);

            // Obj 2: Pages (Kids placeholder)
            const pagesObjIdx = addObject(``); // updated later

            // Fonts
            const font1Idx = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
            const font2Idx = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);

            // Create Page & Content objects
            const pageObjIndices = [];
            pageContents.forEach(streamContent => {
                const streamBytes = new TextEncoder().encode(streamContent);
                const contentObjIdx = addObject(`<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream`);
                const pageObjIdx = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjIdx} 0 R /Resources << /Font << /F1 ${font1Idx} 0 R /F2 ${font2Idx} 0 R >> >> >>`);
                pageObjIndices.push(pageObjIdx);
            });

            // Update Obj 2 (Pages)
            const kidsStr = pageObjIndices.map(idx => `${idx} 0 R`).join(' ');
            objects[pagesObjIdx - 1] = `<< /Type /Pages /Kids [${kidsStr}] /Count ${totalPages} >>`;

            // Build binary PDF
            let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
            const xrefOffsets = [];

            objects.forEach((objContent, i) => {
                xrefOffsets.push(pdf.length);
                pdf += `${i + 1} 0 obj\n${objContent}\nendobj\n`;
            });

            const startXref = pdf.length;
            pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
            xrefOffsets.forEach(off => {
                pdf += String(off).padStart(10, '0') + ' 00000 n \n';
            });
            pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

            const pdfBytes = new TextEncoder().encode(pdf);
            if (options.asBuffer || options.raw) {
                return pdfBytes;
            }
            if (typeof Blob !== 'undefined') {
                return new Blob([pdfBytes], { type: 'application/pdf' });
            }
            return pdfBytes;
        },

        download(filename, content, mimeType) {
            let blob;
            if (typeof Blob !== 'undefined' && content instanceof Blob) {
                blob = content;
            } else if (content instanceof Uint8Array || (typeof ArrayBuffer !== 'undefined' && content instanceof ArrayBuffer)) {
                blob = (typeof Blob !== 'undefined') ? new Blob([content], { type: mimeType || 'application/octet-stream' }) : null;
            } else {
                blob = (typeof Blob !== 'undefined') ? new Blob([String(content)], { type: mimeType || 'text/plain;charset=utf-8' }) : null;
            }

            if (typeof document !== 'undefined' && document.createElement && typeof URL !== 'undefined' && URL.createObjectURL && blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';
                (document.body || document.documentElement).appendChild(a);
                if (typeof a.click === 'function') a.click();
                setTimeout(() => {
                    a.remove();
                    URL.revokeObjectURL(url);
                }, 150);
            }

            return { filename, mime: mimeType, content, blob };
        },

        readFile(file) {
            return new Promise(async (resolve, reject) => {
                if (!file) return reject(new Error('Nenhum arquivo fornecido.'));
                const name = file.name || 'arquivo';
                const lower = name.toLowerCase();

                if (lower.endsWith('.xlsx')) {
                    if (typeof file.arrayBuffer === 'function') {
                        try {
                            const buffer = await file.arrayBuffer();
                            const ds = await this.fromXLSX(buffer, { title: name.replace(/\.xlsx$/i, '') });
                            return resolve(ds);
                        } catch (err) {
                            return reject(err);
                        }
                    } else if (typeof FileReader !== 'undefined') {
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                            try {
                                const ds = await this.fromXLSX(e.target.result, { title: name.replace(/\.xlsx$/i, '') });
                                resolve(ds);
                            } catch (err) {
                                reject(err);
                            }
                        };
                        reader.onerror = () => reject(reader.error || new Error('Falha ao ler o arquivo .xlsx'));
                        reader.readAsArrayBuffer(file);
                    } else {
                        reject(new Error('Ambiente sem suporte a leitura de arquivos binários (file.arrayBuffer ou FileReader).'));
                    }
                } else {
                    if (typeof file.text === 'function') {
                        try {
                            const text = await file.text();
                            return resolve(this.parse(text, { title: name }));
                        } catch (err) {
                            return reject(err);
                        }
                    } else if (typeof FileReader !== 'undefined') {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                const text = e.target.result;
                                resolve(this.parse(text, { title: name }));
                            } catch (err) {
                                reject(err);
                            }
                        };
                        reader.onerror = () => reject(reader.error);
                        reader.readAsText(file);
                    } else {
                        reject(new Error('Ambiente sem suporte a leitura de texto (file.text ou FileReader).'));
                    }
                }
            });
        },

        convert(input, targetFormat, options = {}) {
            const ds = this.parse(input, options);
            const fmt = String(targetFormat || 'csv').trim().toLowerCase();
            let content;
            let ext;
            let mime;

            switch (fmt) {
                case 'csv':
                    content = this.toCSV(ds, options);
                    ext = 'csv';
                    mime = 'text/csv;charset=utf-8';
                    break;
                case 'json':
                    content = this.toJSON(ds, options);
                    ext = 'json';
                    mime = 'application/json';
                    break;
                case 'xml':
                    content = this.toXML(ds, options);
                    ext = 'xml';
                    mime = 'application/xml';
                    break;
                case 'xls':
                    content = this.toXLS(ds, options);
                    ext = 'xls';
                    mime = 'application/vnd.ms-excel';
                    break;
                case 'xlsx':
                    content = this.toXLSX(ds, options);
                    ext = 'xlsx';
                    mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                case 'pdf':
                    content = this.toPDF(ds, options);
                    ext = 'pdf';
                    mime = 'application/pdf';
                    break;
                default:
                    throw new Error(`Formato de destino "${targetFormat}" não suportado. Use: csv, json, xml, xls, xlsx ou pdf.`);
            }

            const baseName = (options.filename || ds.title || 'dados').replace(/\.[a-zA-Z0-9]+$/, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
            const filename = `${baseName}.${ext}`;

            if (options.autoDownload !== false && typeof document !== 'undefined') {
                this.download(filename, content, mime);
            }

            return {
                dataset: ds,
                format: fmt,
                filename,
                content,
                mime,
                download: () => this.download(filename, content, mime)
            };
        },

        /**
         * Atualiza o valor de uma célula específica
         * @param {Object} dataset { headers, rows }
         * @param {number} rowIndex Índice da linha
         * @param {number} colIndex Índice da coluna
         * @param {*} value Novo valor
         */
        updateCell(dataset, rowIndex, colIndex, value) {
            if (!dataset || !Array.isArray(dataset.rows)) return false;
            if (rowIndex < 0 || rowIndex >= dataset.rows.length) return false;
            const row = dataset.rows[rowIndex];
            if (!Array.isArray(row) || colIndex < 0 || colIndex >= dataset.headers.length) return false;
            row[colIndex] = value;
            return true;
        },

        /**
         * Adiciona uma nova linha ao dataset
         * @param {Object} dataset { headers, rows }
         * @param {Array} values Array de valores para a linha (opcional)
         */
        addRow(dataset, values = []) {
            if (!dataset || !Array.isArray(dataset.rows)) return null;
            const colCount = Array.isArray(dataset.headers) ? dataset.headers.length : (values ? values.length : 0);
            const newRow = [];
            for (let i = 0; i < colCount; i++) {
                newRow.push(i < values.length && values[i] !== undefined ? values[i] : '');
            }
            dataset.rows.push(newRow);
            return newRow;
        },

        /**
         * Remove uma linha pelo índice
         * @param {Object} dataset { headers, rows }
         * @param {number} rowIndex Índice da linha
         */
        removeRow(dataset, rowIndex) {
            if (!dataset || !Array.isArray(dataset.rows)) return null;
            if (rowIndex < 0 || rowIndex >= dataset.rows.length) return null;
            return dataset.rows.splice(rowIndex, 1)[0];
        },

        /**
         * Adiciona uma nova coluna ao dataset
         * @param {Object} dataset { headers, rows }
         * @param {string} name Nome do novo cabeçalho
         * @param {*} defaultValue Valor padrão para as linhas existentes
         */
        addColumn(dataset, name, defaultValue = '') {
            if (!dataset) return false;
            if (!Array.isArray(dataset.headers)) dataset.headers = [];
            if (!Array.isArray(dataset.rows)) dataset.rows = [];

            const colName = name || `Coluna_${dataset.headers.length + 1}`;
            dataset.headers.push(colName);
            dataset.rows.forEach(row => {
                if (Array.isArray(row)) {
                    row.push(defaultValue);
                }
            });
            return true;
        },

        /**
         * Remove uma coluna pelo índice ou nome
         * @param {Object} dataset { headers, rows }
         * @param {number|string} indexOrName Índice ou nome da coluna
         */
        removeColumn(dataset, indexOrName) {
            if (!dataset || !Array.isArray(dataset.headers)) return false;
            let colIdx = -1;
            if (typeof indexOrName === 'number') {
                colIdx = indexOrName;
            } else {
                colIdx = dataset.headers.indexOf(indexOrName);
            }
            if (colIdx < 0 || colIdx >= dataset.headers.length) return false;

            dataset.headers.splice(colIdx, 1);
            if (Array.isArray(dataset.rows)) {
                dataset.rows.forEach(row => {
                    if (Array.isArray(row)) {
                        row.splice(colIdx, 1);
                    }
                });
            }
            return true;
        },

        /**
         * Renomeia uma coluna pelo índice ou nome atual
         * @param {Object} dataset { headers, rows }
         * @param {number|string} indexOrName Índice ou nome atual
         * @param {string} newName Novo nome da coluna
         */
        renameColumn(dataset, indexOrName, newName) {
            if (!dataset || !Array.isArray(dataset.headers) || !newName) return false;
            let colIdx = -1;
            if (typeof indexOrName === 'number') {
                colIdx = indexOrName;
            } else {
                colIdx = dataset.headers.indexOf(indexOrName);
            }
            if (colIdx < 0 || colIdx >= dataset.headers.length) return false;

            dataset.headers[colIdx] = String(newName);
            return true;
        },

        /**
         * Converte um dataset em estrutura de dados para gráficos FramePER.Chart
         * @param {Object} dataset { headers, rows }
         * @param {Object} options { labelColumn, seriesColumns, valueColumn, aggregation, maxItems }
         * @returns {Object} { labels, series, pieSeries }
         */
        toChartData(dataset, options = {}) {
            if (!dataset || !Array.isArray(dataset.headers) || !Array.isArray(dataset.rows)) {
                return { labels: [], series: [], pieSeries: [] };
            }

            const headers = dataset.headers;
            const rows = dataset.rows;
            if (headers.length === 0 || rows.length === 0) {
                return { labels: [], series: [], pieSeries: [] };
            }

            // Helper para conversão de célula em número
            function parseNum(val) {
                if (typeof val === 'number') return isNaN(val) ? 0 : val;
                if (!val) return 0;
                let s = String(val).trim();
                s = s.replace(/[^0-9,\.\-]/g, '');
                if (s.includes(',') && s.includes('.')) {
                    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
                        s = s.replace(/\./g, '').replace(',', '.');
                    } else {
                        s = s.replace(/,/g, '');
                    }
                } else if (s.includes(',')) {
                    s = s.replace(',', '.');
                }
                const n = parseFloat(s);
                return isNaN(n) ? 0 : n;
            }

            // Helper para verificar se uma coluna é majoritariamente numérica
            function isNumericCol(colIdx) {
                let numericCount = 0;
                let totalChecked = 0;
                for (let r = 0; r < Math.min(rows.length, 20); r++) {
                    const v = rows[r][colIdx];
                    if (v !== undefined && v !== null && String(v).trim() !== '') {
                        totalChecked++;
                        if (typeof v === 'number' || (!isNaN(Number(v)) || /[0-9]/.test(String(v)))) {
                            numericCount++;
                        }
                    }
                }
                return totalChecked > 0 && (numericCount / totalChecked) >= 0.7;
            }

            // 1. Identificar coluna de Rótulos (Label Column)
            let labelIdx = -1;
            if (options.labelColumn !== undefined) {
                labelIdx = typeof options.labelColumn === 'number'
                    ? options.labelColumn
                    : headers.indexOf(options.labelColumn);
            }
            if (labelIdx === -1) {
                for (let i = 0; i < headers.length; i++) {
                    if (!isNumericCol(i)) {
                        labelIdx = i;
                        break;
                    }
                }
                if (labelIdx === -1) labelIdx = 0;
            }

            const aggregation = options.aggregation || 'none';

            // Caso Agrupado: 'sum', 'count' ou 'avg'
            if (aggregation === 'sum' || aggregation === 'count' || aggregation === 'avg') {
                let valIdx = -1;
                const reqValCol = options.valueColumn || (Array.isArray(options.seriesColumns) ? options.seriesColumns[0] : null);
                if (reqValCol !== null && reqValCol !== undefined) {
                    valIdx = typeof reqValCol === 'number' ? reqValCol : headers.indexOf(reqValCol);
                }
                if (valIdx === -1) {
                    for (let i = 0; i < headers.length; i++) {
                        if (i !== labelIdx && isNumericCol(i)) {
                            valIdx = i;
                            break;
                        }
                    }
                    if (valIdx === -1) valIdx = labelIdx === 0 && headers.length > 1 ? 1 : 0;
                }

                const groups = new Map();
                for (let r = 0; r < rows.length; r++) {
                    const labelVal = String(rows[r][labelIdx] != null ? rows[r][labelIdx] : '');
                    const numVal = parseNum(rows[r][valIdx]);

                    if (!groups.has(labelVal)) {
                        groups.set(labelVal, { count: 0, sum: 0 });
                    }
                    const entry = groups.get(labelVal);
                    entry.count++;
                    entry.sum += numVal;
                }

                let labels = Array.from(groups.keys());
                let values = [];
                if (aggregation === 'count') {
                    values = labels.map(k => groups.get(k).count);
                } else if (aggregation === 'avg') {
                    values = labels.map(k => {
                        const g = groups.get(k);
                        return g.count ? parseFloat((g.sum / g.count).toFixed(2)) : 0;
                    });
                } else {
                    values = labels.map(k => parseFloat(groups.get(k).sum.toFixed(2)));
                }

                if (options.maxItems && options.maxItems > 0 && labels.length > options.maxItems) {
                    labels = labels.slice(0, options.maxItems);
                    values = values.slice(0, options.maxItems);
                }

                const metricName = aggregation === 'count' ? 'Contagem' : (headers[valIdx] || 'Total');
                const pieSeries = labels.map((name, i) => ({ name, value: values[i] }));

                return {
                    labels,
                    series: [{ name: metricName, data: values }],
                    pieSeries
                };
            }

            // Caso Não-Agrupado ('none'): cada linha do dataset é um ponto
            let seriesIndices = [];
            if (Array.isArray(options.seriesColumns) && options.seriesColumns.length > 0) {
                options.seriesColumns.forEach(c => {
                    const idx = typeof c === 'number' ? c : headers.indexOf(c);
                    if (idx !== -1) seriesIndices.push(idx);
                });
            } else if (options.valueColumn !== undefined) {
                const idx = typeof options.valueColumn === 'number' ? options.valueColumn : headers.indexOf(options.valueColumn);
                if (idx !== -1) seriesIndices.push(idx);
            } else {
                for (let i = 0; i < headers.length; i++) {
                    if (i !== labelIdx && isNumericCol(i)) {
                        seriesIndices.push(i);
                    }
                }
                if (seriesIndices.length === 0 && headers.length > 1) {
                    seriesIndices.push(headers.length - 1);
                }
            }

            let effectiveRows = rows;
            if (options.maxItems && options.maxItems > 0 && effectiveRows.length > options.maxItems) {
                effectiveRows = effectiveRows.slice(0, options.maxItems);
            }

            const labels = effectiveRows.map(row => String(row[labelIdx] != null ? row[labelIdx] : ''));
            const series = seriesIndices.map(sIdx => {
                const sName = headers[sIdx] || `Série ${sIdx + 1}`;
                const sData = effectiveRows.map(row => parseNum(row[sIdx]));
                return { name: sName, data: sData };
            });

            const firstSeriesData = series.length > 0 ? series[0].data : [];
            const pieSeries = labels.map((name, i) => ({
                name,
                value: firstSeriesData[i] !== undefined ? firstSeriesData[i] : 0
            }));

            return {
                labels,
                series,
                pieSeries
            };
        },

        /**
         * Cria e empacota um arquivo ZIP contendo múltiplos arquivos
         * @param {Array<{ name: string, data: string|Uint8Array|ArrayBuffer }>} files
         * @param {Object} options { filename, autoDownload }
         * @returns {Object} { filename, mime: 'application/zip', content, download() }
         */
        toZip(files, options = {}) {
            if (!Array.isArray(files) || files.length === 0) {
                throw new Error('Nenhum arquivo fornecido para empacotamento ZIP.');
            }

            const zipBytes = this._createZip(files);
            const filename = options.filename || 'pacote.zip';
            const mime = 'application/zip';

            if (options.autoDownload !== false && typeof document !== 'undefined') {
                this.download(filename, zipBytes, mime);
            }

            return {
                filename,
                mime,
                content: zipBytes,
                download: () => this.download(filename, zipBytes, mime)
            };
        },

        /**
         * Converte múltiplos arquivos de uma vez para um formato alvo e empacota em ZIP
         * @param {Array<File|Object>} files Lista de arquivos a converter
         * @param {string} targetFormat Formato de destino ('xlsx', 'pdf', 'csv', 'json', 'xml', 'xls')
         * @param {Object} options { zipFilename, onProgress, ignoreErrors, autoDownload }
         * @returns {Promise<{ results: Array, zip: Object, download() }>}
         */
        async convertBatch(files, targetFormat, options = {}) {
            if (!Array.isArray(files) || files.length === 0) {
                throw new Error('Nenhum arquivo fornecido para conversão em lote.');
            }

            const results = [];
            const zipFiles = [];
            const total = files.length;
            const fmt = String(targetFormat || 'xlsx').trim().toLowerCase();

            for (let i = 0; i < total; i++) {
                const file = files[i];
                const rawName = file.name || `arquivo_${i + 1}`;
                const baseName = rawName.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[^a-zA-Z0-9_\-]/g, '_');

                try {
                    let dataset;
                    if (file && typeof file.headers !== 'undefined' && typeof file.rows !== 'undefined') {
                        dataset = file;
                    } else if (file && typeof file.text === 'function') {
                        dataset = await this.readFile(file);
                    } else if (file && file.content !== undefined) {
                        dataset = this.parse(file.content, { title: baseName });
                    } else {
                        dataset = await this.readFile(file);
                    }

                    const converted = this.convert(dataset, fmt, {
                        filename: `${baseName}.${fmt}`,
                        title: baseName,
                        autoDownload: false
                    });

                    results.push(converted);
                    zipFiles.push({
                        name: converted.filename,
                        data: converted.content
                    });
                } catch (err) {
                    if (options.ignoreErrors) {
                        console.warn(`[FramePER.Converter] Falha ao converter "${rawName}":`, err);
                    } else {
                        throw err;
                    }
                }

                if (typeof options.onProgress === 'function') {
                    options.onProgress({
                        current: i + 1,
                        total,
                        percent: Math.round(((i + 1) / total) * 100),
                        filename: rawName
                    });
                }
            }

            const zipFilename = options.zipFilename || `conversao_lote_${fmt}.zip`;
            const zipResult = this.toZip(zipFiles, {
                filename: zipFilename,
                autoDownload: options.autoDownload !== false
            });

            return {
                results,
                zip: zipResult,
                download: () => zipResult.download()
            };
        },

        _parseSortValue(val) {
            if (val === null || val === undefined) return { isNull: true, val: null, type: 'null' };
            if (typeof val === 'number') {
                if (isNaN(val)) return { isNull: true, val: null, type: 'null' };
                return { isNull: false, val: val, type: 'number' };
            }
            if (typeof val === 'boolean') {
                return { isNull: false, val: val ? 1 : 0, type: 'number' };
            }
            const s = String(val).trim();
            if (s === '') return { isNull: true, val: null, type: 'null' };

            // Check Brazilian/European date DD/MM/YYYY or DD/MM/YYYY HH:mm:ss
            const brDateMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
            if (brDateMatch) {
                const day = parseInt(brDateMatch[1], 10);
                const month = parseInt(brDateMatch[2], 10) - 1;
                const year = parseInt(brDateMatch[3], 10);
                const hour = brDateMatch[4] ? parseInt(brDateMatch[4], 10) : 0;
                const min = brDateMatch[5] ? parseInt(brDateMatch[5], 10) : 0;
                const sec = brDateMatch[6] ? parseInt(brDateMatch[6], 10) : 0;
                const d = new Date(year, month, day, hour, min, sec);
                if (!isNaN(d.getTime())) {
                    return { isNull: false, val: d.getTime(), type: 'date', raw: s };
                }
            }

            // Check ISO date format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
            if (/^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?)?/.test(s)) {
                const timestamp = Date.parse(s);
                if (!isNaN(timestamp)) {
                    return { isNull: false, val: timestamp, type: 'date', raw: s };
                }
            }

            // Check Currency or Formatted Number
            // Clean common prefixes (R$, $, €, £, etc.) and suffixes (%)
            const numCleaned = s.replace(/^[R$\s€£¥]+/, '').replace(/%$/, '').trim();
            // European / Brazilian number format: 1.234,56 or 1234,56
            if (/^-?\d{1,3}(?:\.\d{3})*,\d+$/.test(numCleaned) || /^-?\d+,\d+$/.test(numCleaned)) {
                const num = parseFloat(numCleaned.replace(/\./g, '').replace(',', '.'));
                if (!isNaN(num)) {
                    return { isNull: false, val: num, type: 'number', raw: s };
                }
            }
            // US format with thousand separator: 1,234.56
            if (/^-?\d{1,3}(?:,\d{3})*\.\d+$/.test(numCleaned)) {
                const num = parseFloat(numCleaned.replace(/,/g, ''));
                if (!isNaN(num)) {
                    return { isNull: false, val: num, type: 'number', raw: s };
                }
            }
            // Standard number string: 1234 or 1234.56
            if (/^-?\d+(?:\.\d+)?$/.test(numCleaned)) {
                const num = parseFloat(numCleaned);
                if (!isNaN(num)) {
                    return { isNull: false, val: num, type: 'number', raw: s };
                }
            }

            // Default to string / text
            return { isNull: false, val: s, type: 'text', raw: s };
        },

        sort(dataset, sortRules, options = {}) {
            if (!dataset || !Array.isArray(dataset.rows)) {
                return dataset;
            }
            const headers = dataset.headers || [];
            const rawRules = Array.isArray(sortRules) ? sortRules : (sortRules ? [sortRules] : []);
            const rules = rawRules.map(r => {
                let ruleObj = (typeof r === 'object' && r !== null) ? { ...r } : { column: r, order: 'asc' };
                let colIdx = -1;
                if (typeof ruleObj.column === 'number') {
                    colIdx = ruleObj.column;
                } else if (typeof ruleObj.column === 'string') {
                    const targetName = ruleObj.column.trim().toLowerCase();
                    colIdx = headers.findIndex(h => String(h).trim().toLowerCase() === targetName);
                }
                const order = (ruleObj.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
                return { colIdx, order };
            }).filter(r => r.colIdx >= 0 && r.colIdx < headers.length);

            if (rules.length === 0) {
                return {
                    ...dataset,
                    headers: [...headers],
                    rows: dataset.rows.map(r => [...r]),
                    metadata: { ...(dataset.metadata || {}) }
                };
            }

            // Clone dataset
            const clonedRows = dataset.rows.map(r => [...r]);

            clonedRows.sort((rowA, rowB) => {
                for (const rule of rules) {
                    const parsedA = this._parseSortValue(rowA[rule.colIdx]);
                    const parsedB = this._parseSortValue(rowB[rule.colIdx]);

                    // Nulls/empty values are always sent to the bottom regardless of asc/desc
                    if (parsedA.isNull && parsedB.isNull) continue;
                    if (parsedA.isNull) return 1;
                    if (parsedB.isNull) return -1;

                    let cmp = 0;
                    if (parsedA.type === 'number' && parsedB.type === 'number') {
                        cmp = parsedA.val - parsedB.val;
                    } else if (parsedA.type === 'date' && parsedB.type === 'date') {
                        cmp = parsedA.val - parsedB.val;
                    } else {
                        // Compare strings with locale pt-BR
                        const strA = parsedA.raw !== undefined ? String(parsedA.raw) : String(parsedA.val);
                        const strB = parsedB.raw !== undefined ? String(parsedB.raw) : String(parsedB.val);
                        cmp = strA.localeCompare(strB, 'pt-BR', { numeric: true, sensitivity: 'base' });
                    }

                    if (cmp !== 0) {
                        return rule.order === 'desc' ? -cmp : cmp;
                    }
                }
                return 0;
            });

            const result = {
                ...dataset,
                headers: [...headers],
                rows: clonedRows,
                metadata: {
                    ...(dataset.metadata || {}),
                    totalRows: clonedRows.length,
                    totalCols: headers.length,
                    sortedBy: rules
                }
            };

            if (result.sheets && result.activeSheet && result.sheets[result.activeSheet]) {
                result.sheets[result.activeSheet] = {
                    ...result.sheets[result.activeSheet],
                    headers: [...headers],
                    rows: clonedRows
                };
            }

            return result;
        },

        getDistinctValues(dataset, column) {
            if (!dataset || !Array.isArray(dataset.rows)) return [];
            const headers = dataset.headers || [];
            let colIdx = -1;
            if (typeof column === 'number') {
                colIdx = column;
            } else if (typeof column === 'string') {
                const target = column.trim().toLowerCase();
                colIdx = headers.findIndex(h => String(h).trim().toLowerCase() === target);
            }
            if (colIdx < 0 || colIdx >= headers.length) return [];

            const map = new Map();
            for (const row of dataset.rows) {
                const cell = row[colIdx];
                const isNull = (cell === null || cell === undefined || String(cell).trim() === '');
                const key = isNull ? '__FRAMEPER_EMPTY__' : String(cell);
                if (map.has(key)) {
                    map.get(key).count++;
                } else {
                    map.set(key, {
                        value: isNull ? null : cell,
                        label: isNull ? '(Vazio)' : String(cell),
                        count: 1,
                        isNull
                    });
                }
            }

            const distinct = Array.from(map.values());
            distinct.sort((a, b) => {
                if (a.isNull && b.isNull) return 0;
                if (a.isNull) return 1;
                if (b.isNull) return -1;
                const parsedA = this._parseSortValue(a.value);
                const parsedB = this._parseSortValue(b.value);
                if (parsedA.type === 'number' && parsedB.type === 'number') {
                    return parsedA.val - parsedB.val;
                }
                return String(a.label).localeCompare(String(b.label), 'pt-BR', { numeric: true, sensitivity: 'base' });
            });

            return distinct.map(d => ({ value: d.value, label: d.label, count: d.count }));
        },

        filter(dataset, filterRules, options = {}) {
            if (!dataset || !Array.isArray(dataset.rows)) return dataset;
            const headers = dataset.headers || [];
            const rawRules = Array.isArray(filterRules) ? filterRules : (filterRules ? [filterRules] : []);

            const rules = rawRules.map(r => {
                if (!r || typeof r !== 'object') return null;
                let colIdx = -1;
                if (typeof r.column === 'number') {
                    colIdx = r.column;
                } else if (typeof r.column === 'string') {
                    const target = r.column.trim().toLowerCase();
                    colIdx = headers.findIndex(h => String(h).trim().toLowerCase() === target);
                }
                if (colIdx < 0 || colIdx >= headers.length) return null;
                return {
                    colIdx,
                    column: r.column,
                    operator: String(r.operator || 'equals').toLowerCase(),
                    value: r.value,
                    values: Array.isArray(r.values) ? r.values : (r.values !== undefined ? [r.values] : null)
                };
            }).filter(Boolean);

            if (rules.length === 0) {
                return {
                    ...dataset,
                    headers: [...headers],
                    rows: dataset.rows.map(r => [...r]),
                    metadata: { ...(dataset.metadata || {}) }
                };
            }

            const filteredRows = dataset.rows.filter(row => {
                for (const rule of rules) {
                    const cell = row[rule.colIdx];
                    const isCellEmpty = (cell === null || cell === undefined || String(cell).trim() === '');

                    switch (rule.operator) {
                        case 'empty':
                            if (!isCellEmpty) return false;
                            break;
                        case 'not_empty':
                            if (isCellEmpty) return false;
                            break;
                        case 'in':
                            if (!rule.values || rule.values.length === 0) return false;
                            if (isCellEmpty) {
                                const hasEmpty = rule.values.some(v => v === null || v === undefined || String(v).trim() === '' || v === '(Vazio)');
                                if (!hasEmpty) return false;
                            } else {
                                const cellStr = String(cell).trim().toLowerCase();
                                const match = rule.values.some(v => v !== null && v !== undefined && String(v).trim().toLowerCase() === cellStr);
                                if (!match) return false;
                            }
                            break;
                        case 'not_in':
                            if (rule.values && rule.values.length > 0) {
                                if (isCellEmpty) {
                                    const hasEmpty = rule.values.some(v => v === null || v === undefined || String(v).trim() === '' || v === '(Vazio)');
                                    if (hasEmpty) return false;
                                } else {
                                    const cellStr = String(cell).trim().toLowerCase();
                                    const match = rule.values.some(v => v !== null && v !== undefined && String(v).trim().toLowerCase() === cellStr);
                                    if (match) return false;
                                }
                            }
                            break;
                        case 'contains': {
                            if (isCellEmpty) return false;
                            const target = String(rule.value || '').trim().toLowerCase();
                            if (!String(cell).toLowerCase().includes(target)) return false;
                            break;
                        }
                        case 'not_contains': {
                            if (isCellEmpty) return false;
                            const target = String(rule.value || '').trim().toLowerCase();
                            if (String(cell).toLowerCase().includes(target)) return false;
                            break;
                        }
                        case 'starts_with': {
                            if (isCellEmpty) return false;
                            const target = String(rule.value || '').trim().toLowerCase();
                            if (!String(cell).toLowerCase().startsWith(target)) return false;
                            break;
                        }
                        case 'ends_with': {
                            if (isCellEmpty) return false;
                            const target = String(rule.value || '').trim().toLowerCase();
                            if (!String(cell).toLowerCase().endsWith(target)) return false;
                            break;
                        }
                        case 'equals':
                        case '==': {
                            if (isCellEmpty) {
                                if (rule.value !== null && rule.value !== undefined && String(rule.value).trim() !== '') return false;
                            } else {
                                const cellStr = String(cell).trim().toLowerCase();
                                const target = String(rule.value || '').trim().toLowerCase();
                                if (cellStr !== target) return false;
                            }
                            break;
                        }
                        case 'not_equals':
                        case '!=': {
                            if (isCellEmpty) {
                                if (rule.value === null || rule.value === undefined || String(rule.value).trim() === '') return false;
                            } else {
                                const cellStr = String(cell).trim().toLowerCase();
                                const target = String(rule.value || '').trim().toLowerCase();
                                if (cellStr === target) return false;
                            }
                            break;
                        }
                        case 'greater_than':
                        case '>':
                        case 'greater_than_or_equal':
                        case '>=':
                        case 'less_than':
                        case '<':
                        case 'less_than_or_equal':
                        case '<=': {
                            if (isCellEmpty) return false;
                            const parsedCell = this._parseSortValue(cell);
                            const parsedRule = this._parseSortValue(rule.value);
                            if (parsedCell.isNull || parsedRule.isNull) return false;

                            let valA = parsedCell.val;
                            let valB = parsedRule.val;

                            if (rule.operator === 'greater_than' || rule.operator === '>') {
                                if (!(valA > valB)) return false;
                            } else if (rule.operator === 'greater_than_or_equal' || rule.operator === '>=') {
                                if (!(valA >= valB)) return false;
                            } else if (rule.operator === 'less_than' || rule.operator === '<') {
                                if (!(valA < valB)) return false;
                            } else if (rule.operator === 'less_than_or_equal' || rule.operator === '<=') {
                                if (!(valA <= valB)) return false;
                            }
                            break;
                        }
                        default:
                            break;
                    }
                }
                return true;
            });

            const result = {
                ...dataset,
                headers: [...headers],
                rows: filteredRows.map(r => [...r]),
                metadata: {
                    ...(dataset.metadata || {}),
                    totalRows: filteredRows.length,
                    totalCols: headers.length,
                    filteredBy: rules
                }
            };

            if (result.sheets && result.activeSheet && result.sheets[result.activeSheet]) {
                result.sheets[result.activeSheet] = {
                    ...result.sheets[result.activeSheet],
                    headers: [...headers],
                    rows: result.rows
                };
            }

            return result;
        }
    };
    FramePER.Converter = Converter;

    document.addEventListener("DOMContentLoaded", () => {
        if (FramePER.Tour && FramePER.Tour.init) {
            FramePER.Tour.init();
        }
        if (FramePER.Confetti && FramePER.Confetti.init) {
            FramePER.Confetti.init();
        }
        if (FramePER.SegmentedControl && FramePER.SegmentedControl.init) {
            FramePER.SegmentedControl.init();
        }
        if (FramePER.Rating && FramePER.Rating.init) {
            FramePER.Rating.init();
        }
        if (FramePER.ScrollReveal && FramePER.ScrollReveal.init) {
            FramePER.ScrollReveal.init();
        }
        if (FramePER.BottomSheet && FramePER.BottomSheet.init) {
            FramePER.BottomSheet.init();
        }
        if (FramePER.OtpInput && FramePER.OtpInput.init) {
            FramePER.OtpInput.init();
        }
        
        // Hide global page loader if exists
        const staticLoader = document.querySelector('.page-loader-overlay');
        if(staticLoader) {
            staticLoader.classList.remove('show');
            setTimeout(() => staticLoader.remove(), 300);
        }
    });

    // Expose globally
    window.FramePER = FramePER;
    window.FramePERChart = FramePER.Chart;
    window.FramePERUpload = FramePER.Upload;
    window.FramePERTabs = FramePER.Tabs;
    window.FramePERAccordion = FramePER.Accordion;
    window.FramePERPopover = FramePER.Popover;
    window.FramePERContextMenu = FramePER.ContextMenu;
    window.FramePERFormValidator = FramePER.FormValidator;
    window.FramePERActivityFeed = FramePER.ActivityFeed;
    window.FramePERSplitPane = FramePER.SplitPane;
    window.FramePERTreeView = FramePER.TreeView;
    window.FramePERDataGrid = FramePER.DataGrid;
    window.FramePERKanban = FramePER.Kanban;
    window.FramePERTimeline = FramePER.Timeline;
    window.FramePERTour = FramePER.Tour;
    window.FramePERSegmentedControl = FramePER.SegmentedControl;
    window.FramePERRating = FramePER.Rating;
    window.FramePERScrollReveal = FramePER.ScrollReveal;
    window.FramePERBottomSheet = FramePER.BottomSheet;
    window.FramePEROtpInput = FramePER.OtpInput;
    window.FramePERConfetti = FramePER.Confetti;
    window.FramePERConverter = FramePER.Converter;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FramePER;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? (global.window || global) : this), typeof document !== 'undefined' ? document : (typeof global !== 'undefined' ? (global.document || {}) : {}));


