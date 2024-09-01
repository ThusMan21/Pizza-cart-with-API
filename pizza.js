document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Perfect by Thus Man',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0,
            message: '',
            orderHistory: [],

            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart().then(() => {
                        this.showCartData();
                    });
                } else {
                    alert("Username is too short");
                }
            },

            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                    this.cartId = '';
                    localStorage.removeItem('cartId');
                    localStorage.removeItem('username');
                }
            },

            createCart() {
                if (!this.username) {
                    return Promise.resolve();
                }

                const cartId = localStorage['cartId'];

                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        })
                        .catch(error => {
                            console.error('Error creating cart:', error);
                        });
                }
            },

            getCart() {
                if (!this.cartId) {
                    return Promise.reject(new Error('Cart ID is missing.'));
                }
                const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
                return axios.get(getCartUrl)
                    .catch(error => {
                        console.error('Error fetching cart data:', error);
                    });
            },

            addPizza(pizzaId) {
                if (!this.cartId) {
                    return Promise.reject(new Error('Cart ID is missing.'));
                }
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                }).catch(error => {
                    console.error('Error adding pizza to cart:', error);
                });
            },

            removePizza(pizzaId) {
                if (!this.cartId) {
                    return Promise.reject(new Error('Cart ID is missing.'));
                }
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                }).catch(error => {
                    console.error('Error removing pizza from cart:', error);
                });
            },

            payamount(amount) {
                if (!this.cartId) {
                    return Promise.reject(new Error('Cart ID is missing.'));
                }
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code": this.cartId,
                    amount
                }).catch(error => {
                    console.error('Error processing payment:', error);
                });
            },

            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                });
            },

            init() {
                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername;
                }

                axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas;
                    })
                    .catch(error => {
                        console.error('Error fetching pizzas:', error);
                    });

                const storedCartId = localStorage['cartId'];
                if (storedCartId) {
                    this.cartId = storedCartId;
                    this.showCartData();
                } else {
                    this.createCart().then(() => {
                        this.showCartData();
                    });
                }
            },

            addPizzaToCart(pizzaId) {
                this.addPizza(pizzaId).then(() => {
                    this.showCartData();
                });
            },

            removePizzaFromCart(pizzaId) {
                this.removePizza(pizzaId).then(() => {
                    this.showCartData();
                });
            },

            payForCart() {
                this.payamount(this.paymentAmount).then(result => {
                    if (result.data.status === 'failure') {
                        this.message = result.data.message;
                        setTimeout(() => this.message = '', 3000);
                    } else {
                        if (this.paymentAmount > this.cartTotal) {
                            const change = (this.paymentAmount - this.cartTotal).toFixed(2);
                            this.message = `Payment received! Change: R ${change}`;
                        } else {
                            this.message = 'Payment received!';
                        }
                        setTimeout(() => {
                            this.message = '';
                            this.cartPizzas = [];
                            this.cartTotal = 0.00;
                            this.cartId = '';
                            this.paymentAmount = 0;
                            localStorage.removeItem('cartId');
                            this.createCart();
                        }, 3000);
                    }
                }).catch(error => {
                    console.error('Error processing payment:', error);
                });
            },

            loadOrderHistory() {
                if (!this.username) {
                    return Promise.reject(new Error('Username is missing.'));
                }
                const getOrderHistoryUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}/active`; // Update with correct endpoint
                axios.get(getOrderHistoryUrl)
                    .then(result => {
                        this.orderHistory = result.data.orders || [];
                    })
                    .catch(error => {
                        console.error('Error fetching order history:', error);
                    });
            }
        }
    });
});