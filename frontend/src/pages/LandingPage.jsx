import { useNavigate } from 'react-router-dom';
import {
    FaHeartbeat,
    FaHospital,
    FaTint,
    FaChartLine,
    FaShieldAlt,
    FaClock,
    FaGlobe,
    FaAward,
    FaUsers,
    FaNetworkWired,
    FaCheckCircle,
    FaArrowRight
} from 'react-icons/fa';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <FaShieldAlt />,
            title: 'Blockchain Security',
            description: 'Immutable records secured by blockchain technology ensure complete transparency and trust'
        },
        {
            icon: <FaClock />,
            title: 'Real-Time Tracking',
            description: 'Track blood units from donation to transfusion with live updates and notifications'
        },
        {
            icon: <FaChartLine />,
            title: 'Smart Analytics',
            description: 'AI-powered insights for demand prediction and inventory optimization'
        },
        {
            icon: <FaGlobe />,
            title: 'Global Network',
            description: 'Connect hospitals and donors nationwide in a unified ecosystem'
        },
        {
            icon: <FaHeartbeat />,
            title: 'Life-Saving Impact',
            description: 'Every donation tracked, verified, and celebrated with digital certificates'
        },
        {
            icon: <FaAward />,
            title: 'Recognition System',
            description: 'Earn badges and blockchain-verified certificates for your contributions'
        }
    ];

    const howItWorks = [
        {
            step: '1',
            title: 'Register & Verify',
            description: 'Donors and hospitals register on the platform with secure verification',
            icon: <FaUsers />
        },
        {
            step: '2',
            title: 'Donate Blood',
            description: 'Donors schedule appointments and donate at partner hospitals',
            icon: <FaTint />
        },
        {
            step: '3',
            title: 'Blockchain Recording',
            description: 'Every donation is recorded on the blockchain for transparency',
            icon: <FaShieldAlt />
        },
        {
            step: '4',
            title: 'Smart Distribution',
            description: 'AI optimizes blood distribution based on demand and urgency',
            icon: <FaNetworkWired />
        }
    ];

    const stats = [
        { value: '10,000+', label: 'Active Donors' },
        { value: '500+', label: 'Partner Hospitals' },
        { value: '50,000+', label: 'Lives Saved' },
        { value: '99.9%', label: 'System Uptime' }
    ];

    return (
        <div className="bg-animated" style={{ minHeight: '100vh' }}>
            {/* Animated Background */}
            <div className="particles">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="particle" />
                ))}
            </div>
            <div className="gradient-mesh" />

            {/* Hero Section */}
            <div className="hero">
                <div className="hero-content animate-slide-up">
                    <div
                        className="blood-badge blood-badge-lg animate-float"
                        style={{ margin: '0 auto var(--spacing-xl)' }}
                    >
                        <FaTint style={{ fontSize: '2rem' }} />
                    </div>

                    <h1 className="hero-title">
                        LifeChain
                    </h1>
                    <p className="hero-subtitle">
                        Blockchain-Powered Blood Supply Management
                    </p>
                    <p style={{
                        fontSize: '1.125rem',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--spacing-2xl)',
                        maxWidth: '700px',
                        margin: '0 auto var(--spacing-2xl)',
                        lineHeight: 1.8
                    }}>
                        Connecting donors, hospitals, and administrators in a secure, transparent ecosystem
                        that saves lives every day. Every drop tracked. Every life matters.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/login')}
                            style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}
                        >
                            Sign In <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/blood-search')}
                            style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}
                        >
                            Search Blood Availability
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <section className="section" style={{ position: 'relative', zIndex: 10, background: 'var(--bg)' }}>
                <div className="container">
                    <div className="grid grid-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="stat-card stat-card-red animate-bounce-in"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 900,
                                    color: 'var(--primary)',
                                    marginBottom: 'var(--spacing-sm)'
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section" style={{ position: 'relative', zIndex: 10, background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            Why Choose LifeChain?
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                            Advanced technology meets compassionate care
                        </p>
                    </div>

                    <div className="feature-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="feature-icon">
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="section" style={{ position: 'relative', zIndex: 10, background: 'var(--bg)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            How It Works
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                            Simple, secure, and transparent blood supply management
                        </p>
                    </div>

                    <div className="grid grid-4">
                        {howItWorks.map((item, index) => (
                            <div
                                key={index}
                                className="card-3d animate-bounce-in"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    textAlign: 'center',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '40px',
                                    height: '40px',
                                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 900,
                                    fontSize: '1.25rem',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                                }}>
                                    {item.step}
                                </div>
                                <div
                                    className="feature-icon"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%)',
                                        color: 'var(--primary)',
                                        marginTop: 'var(--spacing-lg)'
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <h3 className="feature-title">{item.title}</h3>
                                <p className="feature-description">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="section" style={{ position: 'relative', zIndex: 10, background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div
                        className="card-3d animate-scale-in"
                        style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            maxWidth: '800px',
                            margin: '0 auto',
                            background: 'linear-gradient(135deg, var(--primary-50) 0%, rgba(59, 130, 246, 0.05) 100%)'
                        }}
                    >
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 900,
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            Ready to Make a Difference?
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: 'var(--text-secondary)',
                            marginBottom: 'var(--spacing-xl)',
                            lineHeight: 1.8
                        }}>
                            Join thousands of donors and hundreds of hospitals already using LifeChain
                            to save lives every day. Sign in to get started.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/login')}
                                style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}
                            >
                                <FaHeartbeat /> Sign In Now
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/register')}
                                style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                background: 'var(--bg)',
                padding: 'var(--spacing-2xl) 0',
                borderTop: '1px solid var(--border)',
                position: 'relative',
                zIndex: 10
            }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 'var(--spacing-lg)'
                    }}>
                        <div>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                fontWeight: 900,
                                color: 'var(--primary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}>
                                LifeChain
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Saving lives through technology
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                            <a
                                href="/blood-search"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/blood-search');
                                }}
                            >
                                Search Blood
                            </a>
                            <a
                                href="/login"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/login');
                                }}
                            >
                                Login
                            </a>
                            <a
                                href="/register"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/register');
                                }}
                            >
                                Register
                            </a>
                        </div>
                    </div>
                    <div style={{
                        marginTop: 'var(--spacing-xl)',
                        paddingTop: 'var(--spacing-xl)',
                        borderTop: '1px solid var(--border)',
                        textAlign: 'center',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.875rem'
                    }}>
                        © 2024 LifeChain. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
