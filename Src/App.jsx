import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, X, Menu, Search, ChevronRight, Check } from 'lucide-react';

// --- Configuration and Color Palette ---
const customColors = {
    primary: '#0A7D69', // Dark Teal/Green (Strong accent color)
    accent: '#D4AFB9',  // Light Rose (Subtle accent)
    base: '#FCFBF6',    // Lighter Cream (Main background - airy feel)
    text: '#333333',    // Dark Grey (Body copy)
};

// Global Tailwind Config for dynamic colors
const globalStyles = {
    backgroundColor: customColors.base, 
    color: customColors.text,
    fontFamily: 'Inter, sans-serif'
};

// --- Mock Product Data ---
const PRODUCTS = [
    { id: 101, name: "The Renewal Peptide Serum", price: 49.00, category: "Beauty & Skincare", image: "https://placehold.co/600x600/FCFBF6/333333?text=Clean+Serum" },
    { id: 102, name: "The Classic Tailored Blazer", price: 159.00, category: "Fashion", image: "https://placehold.co/600x600/D4AFB9/333333?text=Linen+Jacket" },
    { id: 103, name: "Woven Bamboo Basket Set", price: 75.00, category: "Home & Lifestyle", image: "https://placehold.co/600x600/0A7D69/FCFBF6?text=Storage+Basket" },
    { id: 104, name: "Merino Wool Knit Dress", price: 129.00, category: "Fashion", image: "https://placehold.co/600x600/B88691/333333?text=Knit+Dress" },
    { id: 105, name: "Ceramic Minimalist Diffuser", price: 65.00, category: "Home & Lifestyle", image: "https://placehold.co/600x600/FCFBF6/0A7D69?text=Diffuser" },
    { id: 106, name: "Barrier Repair Cleansing Balm", price: 32.00, category: "Beauty & Skincare", image: "https://placehold.co/600x600/D4AFB9/333333?text=Cleansing+Balm" },
];

/**
 * Custom hook to manage persistent cart state.
 */
const useCartState = () => {
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem('aluraCart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Failed to load cart from storage:", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('aluraCart', JSON.stringify(cart));
    }, [cart]);

    const calculateSubtotal = useCallback(() => {
        return cart.reduce((sum, item) => {
            const product = PRODUCTS.find(p => p.id === item.id);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    }, [cart]);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const updateQuantity = (productId, delta) => {
        setCart(currentCart => {
            const itemIndex = currentCart.findIndex(i => i.id === productId);
            if (itemIndex === -1) return currentCart;

            const newQuantity = currentCart[itemIndex].quantity + delta;
            
            if (newQuantity <= 0) {
                return currentCart.filter(item => item.id !== productId);
            } else {
                return currentCart.map((item, index) => 
                    index === itemIndex ? { ...item, quantity: newQuantity } : item
                );
            }
        });
    };

    const addToCart = (productId) => {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        setCart(currentCart => {
            const existingItem = currentCart.find(i => i.id === productId);
            if (existingItem) {
                return currentCart.map(item => 
                    item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...currentCart, { id: productId, quantity: 1 }];
            }
        });
    };

    const clearCart = () => setCart([]);

    return { cart, cartCount, calculateSubtotal, updateQuantity, addToCart, clearCart };
};

/**
 * Animated Notification Box (Modal replacement for alerts)
 */
const Notification = ({ message, type = 'success', onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for transition
        }, 3000); 
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? customColors.primary : '#B88691';
    const icon = type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />;

    return (
        <div 
            style={{ backgroundColor: bgColor }}
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 text-white px-5 py-3 rounded-full shadow-2xl z-[200] transition-all duration-300 flex items-center space-x-3 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        >
            {icon}
            <p className="font-medium">{message}</p>
        </div>
    );
};


// --- Header Component (Minimalist, Floating Style) ---
const Header = ({ navigate, cartCount, toggleCart }) => (
    <header className="sticky top-0 z-50 py-5 bg-base/80 backdrop-blur-sm transition duration-300">
        <div className="container mx-auto px-6 flex justify-between items-center">
            
            {/* Left Menu/Search (Conceptual) */}
            <div className="flex items-center space-x-6">
                <button className="p-2 hover:opacity-70 transition" style={{ color: customColors.text }}>
                    <Menu className="w-5 h-5" />
                </button>
                <button className="hidden sm:block text-sm font-light uppercase tracking-widest hover:opacity-70" onClick={() => navigate('about')}>
                    Our Story
                </button>
            </div>

            {/* Logo: Alúra (Elegant Serif-like treatment using thin font weight) */}
            <div 
                className="text-4xl font-extralight tracking-widest cursor-pointer" 
                onClick={() => navigate('home')}
                style={{ color: customColors.primary }}
            >
                Alúra
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-6">
                <button className="p-2 hover:opacity-70 transition" style={{ color: customColors.text }}>
                    <Search className="w-5 h-5" />
                </button>
                <button 
                    className="relative p-2 hover:opacity-70 transition" 
                    onClick={toggleCart}
                    style={{ color: customColors.text }}
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span 
                        className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ backgroundColor: customColors.accent, color: customColors.text }}
                    >
                        {cartCount}
                    </span>
                </button>
            </div>
        </div>
    </header>
);

// --- Cart Modal Component (Updated Aesthetic) ---
const CartModal = ({ isOpen, toggleCart, cart, updateQuantity, calculateSubtotal, navigate }) => {
    const subtotal = calculateSubtotal();
    
    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/40 z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={toggleCart}
            ></div>
            
            {/* Modal Drawer */}
            <div 
                className={`fixed top-0 right-0 h-full w-full sm:w-[450px] z-[100] shadow-2xl flex flex-col transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ backgroundColor: customColors.base }}
            >
                <div className="p-8 flex justify-between items-center border-b border-gray-200">
                    <h2 className="text-xl font-medium uppercase tracking-widest" style={{ color: customColors.text }}>Your Shopping Bag</h2>
                    <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-8 space-y-6">
                    {cart.length === 0 ? (
                        <p className="text-center text-gray-500 py-20 italic">No items in your bag. Find something beautiful.</p>
                    ) : (
                        cart.map(item => {
                            const product = PRODUCTS.find(p => p.id === item.id);
                            if (!product) return null;
                            
                            return (
                                <div key={item.id} className="flex space-x-5 border-b pb-6 last:border-b-0">
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-24 h-24 object-cover rounded-md"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/D4AFB9/333333?text=P"; }}
                                    />
                                    <div className="flex-grow flex flex-col justify-between">
                                        <h3 className="font-medium text-lg" style={{ color: customColors.text }}>{product.name}</h3>
                                        <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-gray-300 rounded-full">
                                                <button onClick={() => updateQuantity(product.id, -1)} className="px-3 py-1 text-base hover:bg-gray-100 rounded-l-full transition">-</button>
                                                <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(product.id, 1)} className="px-3 py-1 text-base hover:bg-gray-100 rounded-r-full transition">+</button>
                                            </div>
                                            <span className="font-semibold" style={{ color: customColors.primary }}>${(product.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-8 border-t border-gray-200">
                    <div className="flex justify-between text-xl font-medium mb-6">
                        <span style={{ color: customColors.text }}>Subtotal</span>
                        <span className="font-bold" style={{ color: customColors.text }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={() => { navigate('checkout'); toggleCart(); }} 
                        className="w-full py-4 rounded-xl text-white text-lg font-medium transition duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                        style={{ backgroundColor: customColors.primary }}
                        disabled={subtotal === 0}
                    >
                        <span>Checkout Now</span>
                        <ChevronRight className='w-5 h-5' />
                    </button>
                </div>
            </div>
        </>
    );
};

// --- HomePage Component (Magazine Style) ---
const HomePage = ({ addToCart }) => {
    // --- Hero Section: Full Screen Aesthetic ---
    const HeroSection = () => (
        <section 
            className="h-[70vh] md:h-[85vh] flex items-center justify-center text-center relative overflow-hidden" 
            style={{ backgroundColor: customColors.accent }}
        >
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(https://placehold.co/1200x800/D4AFB9/333333?text=Aesthetic+Background)` }}></div>
            <div className="relative z-10 p-4">
                <h1 
                    className="text-7xl md:text-8xl font-extralight mb-6 tracking-wide" 
                    style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >
                    Alúra Style Hub
                </h1>
                <p 
                    className="text-xl md:text-2xl font-light max-w-2xl mx-auto" 
                    style={{ color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                >
                    Curated. Conscious. Timeless.
                </p>
                <a href="#featured" className="inline-block mt-10 text-sm uppercase tracking-[.25em] pb-1 border-b transition duration-300 hover:opacity-80" style={{ color: 'white', borderColor: 'white' }}>
                    Shop the Collections
                </a>
            </div>
        </section>
    );

    // --- Product Card Component (Minimalist) ---
    const ProductCard = ({ product }) => (
        <div 
            className="group flex flex-col transition duration-300"
        >
            <div className="overflow-hidden mb-4 rounded-lg">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-[1.05]"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x600/${customColors.accent.replace('#', '')}/${customColors.text.replace('#', '')}?text=${product.name.replace(/\s/g, '+')}`; }}
                />
            </div>
            <div className="flex justify-between items-start text-left">
                <div>
                    <h3 className="text-lg font-medium mb-1" style={{ color: customColors.text }}>{product.name}</h3>
                    <p className="font-light text-sm text-gray-500 capitalize">{product.category}</p>
                </div>
                <p className="font-semibold text-lg" style={{ color: customColors.primary }}>${product.price.toFixed(2)}</p>
            </div>
            <button 
                onClick={() => addToCart(product.id)} 
                className="mt-3 py-2 border text-sm uppercase tracking-widest transition duration-300 opacity-0 group-hover:opacity-100 hover:bg-opacity-90"
                style={{ borderColor: customColors.primary, color: customColors.primary }}
            >
                Add to Bag
            </button>
        </div>
    );

    // --- Featured Products Grid ---
    const FeaturedProductsSection = () => (
        <section id="featured" className="container mx-auto px-6 py-24">
            <h2 className="text-4xl font-light uppercase tracking-[.3em] text-center mb-16" style={{ color: customColors.text }}>The Alúra Edit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                {PRODUCTS.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            
            <div className="text-center mt-20">
                <button 
                    onClick={() => {}} // Conceptual link to full shop page
                    className="px-10 py-3 border text-sm uppercase tracking-widest transition duration-300 hover:bg-gray-100"
                    style={{ borderColor: customColors.text, color: customColors.text }}
                >
                    View All Collections
                </button>
            </div>
        </section>
    );

    return (
        <>
            <HeroSection />
            <FeaturedProductsSection />
        </>
    );
};

// --- About Page Component ---
const AboutPage = () => (
    <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-lg" style={{ backgroundColor: 'white' }}>
            <h1 className="text-5xl font-light mb-8 text-center uppercase tracking-widest" style={{ color: customColors.primary }}>
                Our Intentional Story
            </h1>
            <hr className="w-20 mx-auto mb-10 border-t-2" style={{ borderColor: customColors.accent }} />
            
            <p className="mb-6 text-xl leading-relaxed italic text-gray-600 text-center">
                "Alúra is founded on the conviction that a beautiful life requires conscious choices, from the clothes we wear to the products that fill our homes."
            </p>

            <h2 className="text-3xl font-medium mb-4 mt-10" style={{ color: customColors.text }}>
                The Alúra Philosophy
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-gray-700">
                We hand-select items across **Beauty & Skincare**, **Modern Fashion**, and **Home & Lifestyle** based on minimalist design, ethical sourcing, and enduring quality. Our light, sophisticated aesthetic is designed to reflect the transparency and high standard of our curation process.
            </p>

            <h2 className="text-3xl font-medium mb-4 mt-12" style={{ color: customColors.text }}>
                Digital Dropshipping: Defined
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-gray-700">
                Our model ensures that your item is shipped directly from our specialized, certified partners. This method is key to maintaining a low environmental footprint, minimizing warehousing costs, and providing you with the freshest, most current inventory available. This efficient system allows us to focus entirely on product quality and customer experience, eliminating unnecessary steps.
            </p>
        </div>
    </div>
);

// --- Checkout Page Component (Clean and Focused) ---
const CheckoutPage = ({ cart, calculateSubtotal, clearCart, navigate, triggerNotification }) => {
    const subtotal = calculateSubtotal();
    const SHIPPING = 7.50;
    const TAX_RATE = 0.05;
    const tax = subtotal * TAX_RATE;
    const total = subtotal > 0 ? subtotal + SHIPPING + tax : 0;

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-6 py-24 text-center">
                <h1 className="text-4xl font-light mb-4" style={{ color: customColors.text }}>Your Bag is Empty</h1>
                <p className="text-lg text-gray-600 mb-8">Please add items to proceed to your purchase.</p>
                <button 
                    onClick={() => navigate('home')} 
                    className="px-8 py-3 text-white text-sm uppercase tracking-widest rounded-full transition duration-300"
                    style={{ backgroundColor: customColors.primary }}
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    const handleCheckout = (e) => {
        e.preventDefault();
        
        // --- Conceptual Dropshipping & Payment Simulation ---
        console.log("--- Payment Gateway & Dropshipping Fulfillment Simulation ---");
        
        // 1. Clear state and notify user
        clearCart();
        triggerNotification("Order placed successfully. Thank you for choosing Alúra.", 'success');
        
        // 2. Navigate home
        setTimeout(() => navigate('home'), 100);
    };

    const OrderSummary = () => (
        <div className="p-8 sticky top-28" style={{ backgroundColor: 'white', border: `1px solid ${customColors.accent}` }}>
            <h2 className="text-xl font-medium uppercase tracking-wider mb-6" style={{ color: customColors.primary }}>Your Order</h2>
            
            {/* Itemized Cart */}
            <div className="border-b pb-4 mb-4 space-y-3">
                {cart.map(item => {
                    const product = PRODUCTS.find(p => p.id === item.id);
                    if (!product) return null;
                    return (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{product.name} (x{item.quantity})</span>
                            <span className="font-medium">${(product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    );
                })}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-base">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${SHIPPING.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex justify-between pt-4 mt-6 border-t border-gray-300">
                <span className="text-xl font-bold" style={{ color: customColors.text }}>TOTAL</span>
                <span className="text-xl font-bold" style={{ color: customColors.primary }}>${total.toFixed(2)}</span>
            </div>
        </div>
    );

    const CheckoutForm = () => (
        <div className="lg:w-7/12 p-8 rounded-lg" style={{ backgroundColor: 'white' }}>
            <h2 className="text-xl font-medium uppercase tracking-wider mb-8" style={{ color: customColors.primary }}>Shipping & Payment</h2>
            
            <form onSubmit={handleCheckout}>
                {/* Shipping Info */}
                <h3 className="text-lg font-medium mb-3 border-b pb-2" style={{ color: customColors.text }}>Contact Information</h3>
                <input type="email" placeholder="Email Address" required className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />

                <h3 className="text-lg font-medium mb-3 border-b pb-2 mt-8" style={{ color: customColors.text }}>Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" required className="p-3 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />
                    <input type="text" placeholder="Last Name" required className="p-3 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />
                    <input type="text" placeholder="Street Address" required className="p-3 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition md:col-span-2" />
                    <input type="text" placeholder="City" required className="p-3 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />
                    <input type="text" placeholder="Postal Code" required className="p-3 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />
                </div>

                {/* Payment Info */}
                <h3 className="text-lg font-medium mb-3 border-b pb-2 mt-12" style={{ color: customColors.text }}>Payment (Simulated)</h3>
                <input type="text" placeholder="Name on Card" required className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />
                <input type="text" placeholder="Card Number" required className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" required className="p-3 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />
                    <input type="text" placeholder="CVV" required className="p-3 border border-gray-300 rounded-md focus:ring-accent focus:border-accent transition" />
                </div>
                
                <button 
                    type="submit" 
                    className="mt-10 w-full py-4 text-white text-lg font-medium uppercase tracking-widest rounded-xl shadow-lg transition duration-300 hover:opacity-90"
                    style={{ backgroundColor: customColors.accent }}
                >
                    Confirm Order
                </button>
            </form>
        </div>
    );

    return (
        <div className="container mx-auto px-6 py-20">
            <h1 className="text-4xl font-light mb-12 text-center uppercase tracking-widest" style={{ color: customColors.primary }}>Secure Payment</h1>
            <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                <CheckoutForm />
                <div className="lg:w-5/12">
                    <OrderSummary />
                </div>
            </div>
        </div>
    );
};


/**
 * Main Application Component
 */
export default function App() {
    const [page, setPage] = useState('home');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const { cart, cartCount, calculateSubtotal, updateQuantity, addToCart, clearCart } = useCartState();

    const toggleCart = () => setIsCartOpen(prev => !prev);
    
    const navigate = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const triggerNotification = (message, type) => {
        setNotification({ message, type });
    };

    const handleAddToCart = (productId) => {
        addToCart(productId);
        triggerNotification("Item added to bag.", 'success');
    };

    // Render the current page content
    const renderPage = () => {
        switch (page) {
            case 'home':
                return <HomePage addToCart={handleAddToCart} />;
            case 'about':
                return <AboutPage />;
            case 'checkout':
                return <CheckoutPage 
                            cart={cart} 
                            calculateSubtotal={calculateSubtotal} 
                            clearCart={clearCart} 
                            navigate={navigate} 
                            triggerNotification={triggerNotification}
                        />;
            default:
                return <HomePage addToCart={handleAddToCart} />;
        }
    };

    return (
        <div style={globalStyles} className="font-sans min-h-screen">
            
            <Header navigate={navigate} cartCount={cartCount} toggleCart={toggleCart} />
            
            <main className="flex-grow">
                {renderPage()}
            </main>

            <CartModal 
                isOpen={isCartOpen} 
                toggleCart={toggleCart} 
                cart={cart} 
                updateQuantity={updateQuantity} 
                calculateSubtotal={calculateSubtotal} 
                navigate={navigate}
            />

            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}

            {/* Footer - Minimal and elegant */}
            <footer className="py-12 border-t mt-20" style={{ borderColor: customColors.primary, backgroundColor: customColors.base }}>
                <div className="container mx-auto px-6 text-center">
                    <div className="text-3xl font-extralight mb-4" style={{ color: customColors.primary }}>Alúra</div>
                    <p className="text-sm uppercase tracking-widest text-gray-600 mb-6">Conscious Curation. Lasting Quality.</p>
                    <div className="flex justify-center space-x-8 text-sm text-gray-700">
                        <button className="hover:text-primary transition duration-200" onClick={() => navigate('about')}>About</button>
                        <button className="hover:text-primary transition duration-200" onClick={() => triggerNotification('Contact us: support@alura.com', 'success')}>Contact</button>
                        <button className="hover:text-primary transition duration-200" onClick={() => triggerNotification('Terms of Service and Privacy Policy displayed in console.', 'success')}>Legal</button>
                    </div>
                    <p className="text-xs mt-8 text-gray-500">&copy; 2025 Alúra. Conceptual Storefront.</p>
                </div>
            </footer>
        </div>
    );
}
