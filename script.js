// FITCORE - Core Logic

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.classList.remove('py-4');
        } else {
            navbar.classList.remove('scrolled');
            navbar.classList.add('py-4');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        const isClosed = mobileMenu.classList.contains('translate-x-full');
        if (isClosed) {
            mobileMenu.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
        }
    };

    mobileMenuBtn.addEventListener('click', toggleMenu);
    closeMenuBtn.addEventListener('click', toggleMenu);
    
    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
        });
    });

    // --- Scroll Reveal Animation using Intersection Observer ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: unobserve after revealing if you only want it to animate once
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: "0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- BMI Calculator Logic ---
    const calcBmiBtn = document.getElementById('calc-bmi-btn');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bmiResultBox = document.getElementById('bmi-result-box');
    const bmiValueSpan = document.getElementById('bmi-value');
    const bmiCategorySpan = document.getElementById('bmi-category');

    if(calcBmiBtn) {
        calcBmiBtn.addEventListener('click', () => {
            const heightCm = parseFloat(heightInput.value);
            const weightKg = parseFloat(weightInput.value);

            if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) {
                alert("Please enter valid positive numbers for height and weight.");
                return;
            }

            const heightM = heightCm / 100;
            const bmi = (weightKg / (heightM * heightM)).toFixed(1);

            bmiValueSpan.textContent = bmi;

            let category = '';
            let colorClass = '';

            if (bmi < 18.5) {
                category = 'Underweight';
                colorClass = 'text-electric';
            } else if (bmi >= 18.5 && bmi < 24.9) {
                category = 'Normal';
                colorClass = 'text-neon';
            } else if (bmi >= 25 && bmi < 29.9) {
                category = 'Overweight';
                colorClass = 'text-yellow-400';
            } else {
                category = 'Obese';
                colorClass = 'text-red-500';
            }

            // Reset color classes
            bmiCategorySpan.className = `text-lg font-bold pb-1 ${colorClass}`;
            bmiCategorySpan.textContent = category;

            // Show result
            bmiResultBox.classList.remove('hidden');
        });
    }

    // --- Animated Counters ---
    const counterElements = document.querySelectorAll('.stat-counter');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                const duration = 2000; // ms
                const increment = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        entry.target.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                
                updateCounter();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counterElements.forEach(el => counterObserver.observe(el));

    // --- Utils & Modals ---
    const showToast = (message, type = 'success') => {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 text-darker font-bold toast-slide-in ${type === 'success' ? 'bg-neon' : 'bg-electric'}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} text-xl"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.replace('toast-slide-in', 'toast-slide-out');
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    };

    const openModal = (id) => {
        const modal = document.getElementById(id);
        if(modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };
    
    const closeModal = (id) => {
        const modal = document.getElementById(id);
        if(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if(modal) closeModal(modal.id);
        });
    });

    // --- State Management ---
    let currentUser = JSON.parse(localStorage.getItem('fitcore_user')) || null;
    let selectedPlan = null;
    let selectedPrice = 0;
    let finalAmount = 0;

    // --- Auth Logic ---
    const navAuthSection = document.getElementById('nav-auth-section');
    const mobileAuthSection = document.getElementById('mobile-auth-section');

    const updateAuthUI = () => {
        // Reset event listeners for dashboard to prevent duplicates
        if (currentUser) {
            const initial = currentUser.name.charAt(0).toUpperCase();
            const loggedInHTML = `
                <button id="nav-dashboard-btn" class="flex items-center gap-2 hover:text-neon transition-colors font-bold">
                    <div class="w-8 h-8 rounded-full bg-neon text-darker flex items-center justify-center">${initial}</div>
                    ${currentUser.name.split(' ')[0]}
                </button>
            `;
            if(navAuthSection) navAuthSection.innerHTML = loggedInHTML;
            if(mobileAuthSection) mobileAuthSection.innerHTML = `<button id="mobile-dashboard-btn" class="mobile-link text-neon font-bold mt-2 border border-white/10 p-3 rounded-lg flex items-center justify-center gap-2"><i class="fas fa-user-circle"></i> Dashboard</button>`;
            
            // Attach dashboard button listeners
            document.querySelectorAll('#nav-dashboard-btn, #mobile-dashboard-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    populateDashboard();
                    openModal('dashboard-modal');
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
                        mobileMenu.classList.add('translate-x-full');
                        document.body.style.overflow = '';
                    }
                });
            });
        } else {
            // Logged out HTML
            const loggedOutNavHTML = `
                <button id="nav-login-btn" class="hover:text-neon transition-colors font-bold">LOGIN</button>
                <button id="nav-signup-btn" class="px-6 py-2 border-2 border-neon text-neon hover:bg-neon hover:text-darker transition-all rounded-full font-bold hover-glow">SIGN UP</button>
            `;
            if(navAuthSection) navAuthSection.innerHTML = loggedOutNavHTML;
            if(mobileAuthSection) mobileAuthSection.innerHTML = `
                <button id="mobile-login-btn" class="mobile-link text-white hover:text-neon text-xl py-2">LOGIN</button>
                <button id="mobile-signup-btn" class="mobile-link text-neon font-bold text-xl py-2 border border-neon/50 rounded-lg">SIGN UP</button>
            `;
            attachAuthListeners();
        }
    };

    const attachAuthListeners = () => {
        document.querySelectorAll('#nav-login-btn, #mobile-login-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('tab-login').click();
                openModal('auth-modal');
                document.getElementById('mobile-menu').classList.add('translate-x-full');
                document.body.style.overflow = 'hidden';
            });
        });
        document.querySelectorAll('#nav-signup-btn, #mobile-signup-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('tab-signup').click();
                openModal('auth-modal');
                document.getElementById('mobile-menu').classList.add('translate-x-full');
                document.body.style.overflow = 'hidden';
            });
        });
    };

    // Modal Tab toggles
    document.getElementById('tab-login')?.addEventListener('click', (e) => {
        document.getElementById('form-login').classList.remove('hidden');
        document.getElementById('form-signup').classList.add('hidden');
        e.target.classList.add('border-neon', 'text-neon');
        e.target.classList.remove('border-transparent', 'text-grayLight');
        document.getElementById('tab-signup').classList.remove('border-neon', 'text-neon');
        document.getElementById('tab-signup').classList.add('border-transparent', 'text-grayLight');
    });

    document.getElementById('tab-signup')?.addEventListener('click', (e) => {
        document.getElementById('form-signup').classList.remove('hidden');
        document.getElementById('form-login').classList.add('hidden');
        e.target.classList.add('border-neon', 'text-neon');
        e.target.classList.remove('border-transparent', 'text-grayLight');
        document.getElementById('tab-login').classList.remove('border-neon', 'text-neon');
        document.getElementById('tab-login').classList.add('border-transparent', 'text-grayLight');
    });

    // Password Toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.currentTarget.previousElementSibling;
            if(input.type === 'password') {
                input.type = 'text';
                e.currentTarget.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                e.currentTarget.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    // Ensure robust default state
    const syncUserDefaults = () => {
        if(currentUser) {
            currentUser.transactions = currentUser.transactions || [];
            currentUser.bookings = currentUser.bookings || [];
            currentUser.settings = currentUser.settings || { phone: '', notificationsEmail: true, notificationsSms: false };
            
            // Backfill legacy active plan to transactions if empty
            if (currentUser.activePlan && currentUser.transactions.length === 0) {
                currentUser.transactions.push({
                    id: currentUser.activePlan.txId || 'TXN12345',
                    date: currentUser.activePlan.startDate,
                    plan: currentUser.activePlan.name,
                    amount: currentUser.activePlan.price,
                    method: currentUser.activePlan.method || 'Card'
                });
            }
        }
    };
    syncUserDefaults();

    // Forms Submit (Fake Auth)
    document.getElementById('form-signup')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        
        currentUser = { 
            name, 
            email, 
            joinDate: new Date().toLocaleDateString('en-IN'), 
            activePlan: null,
            transactions: [],
            bookings: [],
            settings: { phone: '', notificationsEmail: true, notificationsSms: false }
        };
        localStorage.setItem('fitcore_user', JSON.stringify(currentUser));
        
        showToast(`Welcome to FITCORE, ${name}!`);
        closeModal('auth-modal');
        updateAuthUI();
        e.target.reset(); // clear form
    });

    document.getElementById('form-login')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        
        // Mock checking existing or create default
        if(!currentUser || currentUser.email !== email) {
            currentUser = { 
                name: "Demo User", 
                email: email, 
                joinDate: new Date().toLocaleDateString('en-IN'), 
                activePlan: null,
                transactions: [],
                bookings: [],
                settings: { phone: '', notificationsEmail: true, notificationsSms: false }
            };
            localStorage.setItem('fitcore_user', JSON.stringify(currentUser));
        } else {
            syncUserDefaults();
        }
        
        showToast(`Logged in successfully!`);
        closeModal('auth-modal');
        updateAuthUI();
        e.target.reset(); // clear form
    });

    // --- Pricing & Checkout Logic ---
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    // Auto-select card if plan is already active
    const syncPricingUI = () => {
        pricingCards.forEach(card => {
            card.classList.remove('active-plan');
            const btn = card.querySelector('.select-plan-btn');
            if(btn) btn.innerHTML = 'Select Plan';
            
            if(currentUser && currentUser.activePlan && currentUser.activePlan.status !== 'Canceled' && card.dataset.plan === currentUser.activePlan.name) {
                card.classList.add('active-plan');
                if(btn) btn.innerHTML = '<i class="fas fa-check mr-2"></i> Current Plan';
            }
        });
    };
    
    // Initial sync
    syncPricingUI();

    const openCheckout = (plan, price) => {
        if(!currentUser) {
            showToast("Please login or create an account first.", "info");
            document.getElementById('tab-signup').click();
            openModal('auth-modal');
            return;
        }

        selectedPlan = plan;
        selectedPrice = parseInt(price);
        
        // Calculate tax implicitly included in the round number
        const base = selectedPrice / 1.18;
        const tax = selectedPrice - base;
        finalAmount = selectedPrice;

        document.getElementById('checkout-plan-name').textContent = `${plan} Plan`;
        document.getElementById('checkout-plan-price').textContent = `₹${selectedPrice.toLocaleString('en-IN')}`;
        document.getElementById('checkout-base-price').textContent = `₹${base.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('checkout-tax').textContent = `₹${tax.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('checkout-final-total').textContent = `₹${finalAmount.toLocaleString('en-IN')}`;
        
        // resets
        document.getElementById('coupon-input').value = '';
        document.getElementById('checkout-discount-row').classList.add('hidden');
        
        openModal('checkout-modal');
    };

    document.querySelectorAll('.select-plan-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.pricing-card');
            openCheckout(card.dataset.plan, card.dataset.price);
        });
    });

    // Coupon Logic
    document.getElementById('apply-coupon-btn')?.addEventListener('click', () => {
        const input = document.getElementById('coupon-input').value.trim().toUpperCase();
        let discount = 0;

        if (input === 'FIT10') {
            discount = finalAmount * 0.10;
        } else if (input === 'PRO20' && selectedPlan === 'Pro') {
            discount = finalAmount * 0.20;
        } else {
            showToast("Invalid or inapplicable coupon.", "info");
            return;
        }

        finalAmount = selectedPrice - discount;
        
        document.getElementById('checkout-discount-row').classList.remove('hidden');
        document.getElementById('checkout-discount-code').textContent = input;
        document.getElementById('checkout-discount-amt').textContent = `-₹${Math.round(discount).toLocaleString('en-IN')}`;
        document.getElementById('checkout-final-total').textContent = `₹${Math.round(finalAmount).toLocaleString('en-IN')}`;
        showToast("Coupon Applied!");
    });


    // --- Payment Flow Logic ---
    document.getElementById('proceed-payment-btn')?.addEventListener('click', () => {
        closeModal('checkout-modal');
        document.getElementById('payment-amount-display').textContent = `₹${Math.round(finalAmount).toLocaleString('en-IN')}`;
        openModal('payment-modal');
    });

    // Payment Tabs Toggle
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.payment-content').forEach(c => {
                c.classList.remove('active', 'block');
                c.classList.add('hidden');
            });
            
            e.currentTarget.classList.add('active');
            const target = document.getElementById(e.currentTarget.dataset.target);
            target.classList.remove('hidden');
            target.classList.add('active', 'block');
        });
    });

    // Fake Processing & Invoice
    document.getElementById('final-pay-btn')?.addEventListener('click', () => {
        const activeTabTarget = document.querySelector('.payment-tab.active').dataset.target;
        let method = "Unknown";
        
        if (activeTabTarget === 'pay-upi') {
            const upi = document.getElementById('upi-id').value;
            if(!upi) return showToast("Please enter UPI ID", "info");
            method = "UPI";
        } else if (activeTabTarget === 'pay-card') {
            method = "Card";
        } else if (activeTabTarget === 'pay-net') {
            method = "Net Banking";
        } else if (activeTabTarget === 'pay-wallet') {
            method = "Wallet";
        }

        // Show loading state
        const btnText = document.getElementById('pay-btn-text');
        const spinner = document.getElementById('pay-spinner');
        btnText.textContent = "Processing...";
        spinner.classList.remove('hidden');
        document.getElementById('final-pay-btn').disabled = true;

        setTimeout(() => {
            // Fake Success
            btnText.textContent = "Pay Securely";
            spinner.classList.add('hidden');
            document.getElementById('final-pay-btn').disabled = false;
            
            closeModal('payment-modal');
            
            // Generate Invoice Data
            const txId = "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase();
            const today = new Date().toLocaleDateString('en-IN');
            
            const newTx = {
                id: txId,
                date: today,
                plan: selectedPlan,
                amount: Math.round(finalAmount),
                method: method
            };
            
            currentUser.transactions.unshift(newTx);
            
            currentUser.activePlan = {
                name: selectedPlan,
                price: Math.round(finalAmount),
                startDate: today,
                status: 'Active',
                txId: txId,
                method: method
            };
            
            localStorage.setItem('fitcore_user', JSON.stringify(currentUser));
            
            // Populate Invoice View
            openExternalInvoice(newTx);
            
            syncPricingUI();

            openModal('invoice-modal');
        }, 2000); // 2 sec fake delay
    });

    const openExternalInvoice = (tx) => {
        document.getElementById('inv-tx').textContent = tx.id;
        document.getElementById('inv-method').textContent = tx.method;
        document.getElementById('inv-date').textContent = tx.date;
        document.getElementById('inv-plan').textContent = tx.plan + " Plan";
        document.getElementById('inv-amount').textContent = `₹${tx.amount.toLocaleString('en-IN')}`;
    };

    document.getElementById('download-invoice-btn')?.addEventListener('click', () => {
        showToast("Invoice Downloaded!");
    });

    document.getElementById('go-dashboard-btn')?.addEventListener('click', () => {
        closeModal('invoice-modal');
        document.querySelectorAll('.dash-nav-tab')[0].click(); // switch to overview
        openModal('dashboard-modal');
    });

    // --- Dashboard logic framework ---
    document.querySelectorAll('.dash-nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            document.querySelectorAll('.dash-nav-tab').forEach(t => t.classList.remove('active', 'text-neon', 'bg-white/10'));
            tab.classList.add('active', 'text-neon', 'bg-white/10');
            
            document.querySelectorAll('.dash-pane').forEach(p => {
                p.classList.remove('active', 'block');
                p.classList.add('hidden');
            });
            const target = document.getElementById(tab.dataset.target);
            target.classList.remove('hidden');
            target.classList.add('active', 'block');
            
            if(tab.dataset.target === 'dash-pane-overview') populateDashboardOverview();
            if(tab.dataset.target === 'dash-pane-memberships') populateDashboardMemberships();
            if(tab.dataset.target === 'dash-pane-billing') populateDashboardBilling();
            if(tab.dataset.target === 'dash-pane-settings') populateDashboardSettings();
        });
    });

    const populateDashboard = () => {
        document.querySelectorAll('.dash-nav-tab')[0].click();
    };

    const getRenewalDetails = (plan) => {
        if(!plan) return { text: "N/A", date: null };
        const parts = plan.startDate.split('/');
        if(parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; 
            const year = parseInt(parts[2], 10);
            const start = new Date(year, month, day);
            start.setMonth(start.getMonth() + 1);
            return { text: start.toLocaleDateString('en-IN'), date: start };
        }
        return { text: "Next Month", date: null };
    };

    const populateDashboardOverview = () => {
        if(!currentUser) return;
        
        document.getElementById('dash-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('dash-name').textContent = currentUser.name;
        document.getElementById('dash-email').textContent = currentUser.email;

        // Try syncing from BMI box
        const bmiResult = document.getElementById('bmi-value')?.textContent;
        document.getElementById('dash-bmi').textContent = (bmiResult && bmiResult !== "0.0") ? bmiResult : "N/A";

        if(currentUser.activePlan) {
            document.getElementById('dash-plan-name').textContent = currentUser.activePlan.name;
            const ren = getRenewalDetails(currentUser.activePlan);
            
            if (currentUser.activePlan.status === 'Canceled') {
                document.getElementById('dash-plan-status').textContent = `Canceled. Active until ${ren.text}.`;
                document.getElementById('dash-plan-status').classList.add('text-red-400');
                document.getElementById('dash-renewal-date').textContent = "Canceled";
                document.getElementById('dash-renewal-subtext').textContent = "Plan will not auto-renew.";
                document.getElementById('dash-buy-btn').classList.remove('hidden');
                document.getElementById('dash-buy-btn').textContent = "Reactivate Plan";
            } else {
                document.getElementById('dash-plan-status').textContent = `Active since ${currentUser.activePlan.startDate}`;
                document.getElementById('dash-plan-status').classList.remove('text-red-400');
                document.getElementById('dash-renewal-date').textContent = ren.text;
                document.getElementById('dash-renewal-subtext').textContent = "Auto-renewal is active";
                document.getElementById('dash-buy-btn').classList.add('hidden');
            }
            
            const txArea = document.getElementById('dash-overview-transactions');
            if (currentUser.transactions && currentUser.transactions.length > 0) {
                const latestTx = currentUser.transactions[0];
                txArea.innerHTML = `
                    <div class="flex justify-between items-center bg-white/5 p-3 rounded border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onclick="document.querySelectorAll('.dash-nav-tab')[2].click()">
                        <div class="flex flex-col md:flex-row md:items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-darker hidden md:flex items-center justify-center text-neon"><i class="fas fa-receipt"></i></div>
                            <div>
                                <p class="font-bold text-sm text-white">${latestTx.plan} Plan Membership</p>
                                <p class="text-xs text-grayLight">${latestTx.date} • Paid via ${latestTx.method}</p>
                                <p class="text-[10px] text-grayLight font-mono">TXN: ${latestTx.id}</p>
                            </div>
                        </div>
                        <span class="font-bold text-neon text-lg ml-2">₹${latestTx.amount.toLocaleString('en-IN')}</span>
                    </div>
                `;
            } else {
                txArea.innerHTML = `<p class="text-grayLight text-sm py-4">No transactions found.</p>`;
            }

        } else {
            document.getElementById('dash-plan-name').textContent = "None";
            document.getElementById('dash-plan-status').textContent = "Get a membership to start training.";
            document.getElementById('dash-plan-status').classList.remove('text-red-400');
            document.getElementById('dash-renewal-date').textContent = "N/A";
            document.getElementById('dash-renewal-subtext').textContent = "";
            document.getElementById('dash-buy-btn').classList.remove('hidden');
            document.getElementById('dash-buy-btn').textContent = "Buy a Plan";
            document.getElementById('dash-overview-transactions').innerHTML = `<p class="text-grayLight text-sm py-4">No transactions found.</p>`;
        }
        
        // Bookings
        const bookingsArea = document.getElementById('dash-upcoming-classes');
        if (currentUser.bookings && currentUser.bookings.length > 0) {
            bookingsArea.innerHTML = '';
            currentUser.bookings.slice(0, 2).forEach(bk => {
                bookingsArea.innerHTML += `
                <div class="bg-white/5 p-3 rounded border border-white/5 flex gap-3 items-center">
                    <div class="w-10 h-10 bg-darker rounded flex items-center justify-center text-electric"><i class="fas fa-dumbbell"></i></div>
                    <div>
                        <p class="text-white text-sm font-bold">${bk.type}</p>
                        <p class="text-xs text-grayLight">${bk.date} at ${bk.time}</p>
                    </div>
                </div>`;
            });
        } else {
            bookingsArea.innerHTML = `<p class="text-grayLight text-sm italic py-2">No upcoming classes.</p>`;
        }
    };

    document.getElementById('dash-buy-btn')?.addEventListener('click', () => {
        closeModal('dashboard-modal');
        document.getElementById('pricing').scrollIntoView({behavior:'smooth'});
    });

    document.getElementById('view-all-billing-btn')?.addEventListener('click', () => {
        document.querySelectorAll('.dash-nav-tab')[2].click();
    });

    // Memberships 
    const populateDashboardMemberships = () => {
        const pane = document.getElementById('memberships-content');
        if(!currentUser || !currentUser.activePlan) {
            pane.innerHTML = `
                <div class="bg-darker border border-white/10 rounded-xl p-8 text-center max-w-lg mx-auto mt-10">
                    <div class="w-16 h-16 bg-white/5 text-grayLight rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">No Active Memberships</h3>
                    <p class="text-sm text-grayLight mb-6">You don't currently have an active plan. Pick one to get started.</p>
                    <button id="mem-buy-btn" class="px-6 py-2 bg-neon text-darker font-bold rounded-lg hover:bg-white transition-colors">View Pricing</button>
                </div>
            `;
            document.getElementById('mem-buy-btn')?.addEventListener('click', () => {
                closeModal('dashboard-modal');
                document.getElementById('pricing').scrollIntoView({behavior:'smooth'});
            });
            return;
        }

        const ren = getRenewalDetails(currentUser.activePlan);
        const isCanceled = currentUser.activePlan.status === 'Canceled';
        
        pane.innerHTML = `
            <div class="bg-darker border border-white/10 rounded-xl p-8 max-w-2xl relative overflow-hidden shadow-inner">
                ${isCanceled ? '<div class="absolute top-4 right-4 bg-red-500/10 text-red-400 text-xs px-3 py-1 font-bold rounded-full border border-red-500/30">CANCELED</div>' : '<div class="absolute top-4 right-4 bg-neon/10 text-neon text-xs px-3 py-1 font-bold rounded-full border border-neon/30">ACTIVE</div>'}
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-neon to-green-600 rounded-2xl flex items-center justify-center text-2xl text-darker shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                        <i class="fas fa-crown"></i>
                    </div>
                    <div>
                        <h3 class="text-3xl font-heading font-bold text-white">${currentUser.activePlan.name} Plan</h3>
                        <p class="text-neon font-bold text-lg">₹${currentUser.activePlan.price.toLocaleString('en-IN')} <span class="text-sm text-grayLight font-normal">/ month</span></p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-8 bg-black/20 p-4 rounded-lg">
                    <div>
                        <p class="text-xs text-grayLight mb-1">Started On</p>
                        <p class="text-sm font-bold text-white">${currentUser.activePlan.startDate}</p>
                    </div>
                    <div>
                        <p class="text-xs text-grayLight mb-1">${isCanceled ? 'Access Ends On' : 'Next Billing Date'}</p>
                        <p class="text-sm font-bold text-white">${ren.text}</p>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-3">
                    <button id="mem-upgrade-btn" class="px-5 py-2 bg-neon text-darker font-bold rounded hover:bg-white transition-colors"><i class="fas fa-arrow-up mr-2"></i>Change Plan</button>
                    ${!isCanceled ? `<button id="mem-cancel-btn" class="px-5 py-2 bg-transparent border border-white/20 text-white font-bold rounded hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors">Cancel Membership</button>` : ''}
                </div>
            </div>
        `;

        document.getElementById('mem-upgrade-btn')?.addEventListener('click', () => {
            closeModal('dashboard-modal');
            document.getElementById('pricing').scrollIntoView({behavior:'smooth'});
        });
        
        document.getElementById('mem-cancel-btn')?.addEventListener('click', () => {
            showConfirmDialog(
                "Cancel Membership", 
                "Are you sure you want to cancel? You will keep access until the end of your billing cycle.",
                () => {
                    currentUser.activePlan.status = 'Canceled';
                    localStorage.setItem('fitcore_user', JSON.stringify(currentUser));
                    populateDashboardMemberships(); // refresh locally
                    syncPricingUI();
                    showToast("Membership canceled. It will run until the cycle ends.", "info");
                }
            );
        });
    };

    // Billing
    const populateDashboardBilling = () => {
        const tbody = document.getElementById('dash-billing-table');
        tbody.innerHTML = '';

        if(!currentUser || !currentUser.transactions || currentUser.transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-grayLight">No billing history available.</td></tr>`;
            return;
        }

        currentUser.transactions.forEach((tx, idx) => {
            const tr = document.createElement('tr');
            tr.className = "border-b border-white/5 hover:bg-white/5 transition-colors";
            tr.innerHTML = `
                <td class="py-4 px-4 text-white">${tx.date}</td>
                <td class="py-4 px-4">
                    <p class="font-bold text-white">${tx.plan} Plan</p>
                    <p class="text-xs text-grayLight font-mono">ID: ${tx.id}</p>
                </td>
                <td class="py-4 px-4 font-bold text-neon">₹${tx.amount.toLocaleString('en-IN')}</td>
                <td class="py-4 px-4">
                    <span class="bg-white/10 px-2 py-1 rounded text-xs text-grayLight">${tx.method}</span>
                </td>
                <td class="py-4 px-4 text-right">
                    <button class="dl-inv-btn text-neon text-sm hover:text-white transition-colors border border-white/10 px-3 py-1 rounded hover:border-neon" data-idx="${idx}"><i class="fas fa-download mr-1"></i> Invoice</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.dl-inv-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tx = currentUser.transactions[parseInt(e.currentTarget.dataset.idx)];
                openExternalInvoice(tx);
                openModal('invoice-modal');
            });
        });
    };

    // Settings
    const populateDashboardSettings = () => {
        if(!currentUser) return;
        document.getElementById('set-name').value = currentUser.name || '';
        document.getElementById('set-email').value = currentUser.email || '';
        document.getElementById('set-phone').value = currentUser.settings.phone || '';
        document.getElementById('set-notif-email').checked = currentUser.settings.notificationsEmail;
        document.getElementById('set-notif-sms').checked = currentUser.settings.notificationsSms;
        document.getElementById('set-pass1').value = '';
        document.getElementById('set-pass2').value = '';
    };

    document.getElementById('settings-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const pass1 = document.getElementById('set-pass1').value;
        const pass2 = document.getElementById('set-pass2').value;
        
        if (pass1 && pass1 !== pass2) {
            showToast("Passwords do not match!", "info");
            return;
        }

        const btnText = document.getElementById('set-save-text');
        const spinner = document.getElementById('set-save-spinner');
        
        btnText.textContent = "Saving...";
        spinner.classList.remove('hidden');

        setTimeout(() => {
            currentUser.name = document.getElementById('set-name').value;
            currentUser.email = document.getElementById('set-email').value;
            currentUser.settings.phone = document.getElementById('set-phone').value;
            currentUser.settings.notificationsEmail = document.getElementById('set-notif-email').checked;
            currentUser.settings.notificationsSms = document.getElementById('set-notif-sms').checked;
            
            localStorage.setItem('fitcore_user', JSON.stringify(currentUser));
            
            // Re-render navs
            updateAuthUI();
            
            btnText.textContent = "Save Changes";
            spinner.classList.add('hidden');
            
            showConfirmDialog("Settings Saved", "Your account settings have been successfully updated.", null, true);
        }, 800);
    });

    // Book A Class Base Logic
    document.getElementById('dash-book-class-btn')?.addEventListener('click', () => {
        openModal('book-class-modal');
    });

    document.getElementById('book-class-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('book-type').value;
        const dateRaw = document.getElementById('book-date').value;
        const timeRaw = document.getElementById('book-time').value;

        const d = new Date(dateRaw);
        const formattedDate = d.toLocaleDateString('en-IN', {month:'short', day:'numeric', year:'numeric'});
        
        currentUser.bookings.unshift({
            type,
            date: formattedDate,
            time: timeRaw
        });
        localStorage.setItem('fitcore_user', JSON.stringify(currentUser));

        closeModal('book-class-modal');
        showToast("Class Booked Successfully!");
        
        if (document.getElementById('dash-pane-overview').classList.contains('active')) {
            populateDashboardOverview();
        }
        e.target.reset();
    });

    // Confirmation Modal System
    let confirmCallback = null;
    const showConfirmDialog = (title, message, callback, alertOnly = false) => {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        confirmCallback = callback;
        
        const actionBtn = document.getElementById('confirm-action-btn');
        const cancelBtn = document.querySelector('#confirm-modal .close-modal');
        if(alertOnly) {
            actionBtn.classList.add('hidden');
            cancelBtn.textContent = "OK";
        } else {
            actionBtn.classList.remove('hidden');
            cancelBtn.textContent = "Cancel";
        }
        
        openModal('confirm-modal');
    };

    document.getElementById('confirm-action-btn')?.addEventListener('click', () => {
        if(confirmCallback) confirmCallback();
        closeModal('confirm-modal');
    });

    // Logout
    document.getElementById('dash-logout-trigger-btn')?.addEventListener('click', () => {
        showConfirmDialog("Logout", "Are you sure you want to log out of FITCORE?", () => {
            currentUser = null;
            localStorage.removeItem('fitcore_user');
            closeModal('dashboard-modal');
            updateAuthUI();
            syncPricingUI();
            showToast("Logged out successfully.");
        });
    });

    // Initialize UI Auth Logic on boot
    updateAuthUI();

});
