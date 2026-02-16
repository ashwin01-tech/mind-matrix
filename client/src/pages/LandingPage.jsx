import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hyperspeed from '../components/Hyperspeed/Hyperspeed';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Shield, Activity } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleEnter = () => {
        navigate('/app');
    };

    const hyperspeedOptions = {
        onSpeedUp: () => { },
        onSlowDown: () => { },
        distortion: 'turbulentDistortion',
        length: 400,
        roadWidth: 10,
        islandWidth: 2,
        lanesPerRoad: 3,
        fov: 90,
        fovSpeedUp: 150,
        speedUp: 2,
        carLightsFade: 0.4,
        totalSideLightSticks: 20,
        lightPairsPerRoadWay: 40,
        shoulderLinesWidthPercentage: 0.05,
        brokenLinesWidthPercentage: 0.1,
        brokenLinesLengthPercentage: 0.5,
        lightStickWidth: [0.12, 0.5],
        lightStickHeight: [1.3, 1.7],
        movingAwaySpeed: [60, 80],
        movingCloserSpeed: [-120, -160],
        carLightsLength: [400 * 0.03, 400 * 0.2],
        carLightsRadius: [0.05, 0.14],
        carWidthPercentage: [0.3, 0.5],
        carShiftX: [-0.8, 0.8],
        carFloorSeparation: [0, 5],
        colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0x131318,
            brokenLines: 0x131318,
            leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
            rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
            sticks: 0x03b3c3
        }
    };

    const FeatureCard = ({ icon: Icon, title, description, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay }}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                borderRadius: '20px',
                textAlign: 'left',
                flex: '1 1 300px',
                maxWidth: '350px',
                margin: '1rem'
            }}
        >
            <div style={{
                background: 'rgba(3, 179, 195, 0.1)',
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#03b3c3'
            }}>
                <Icon size={24} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6' }}>{description}</p>
        </motion.div>
    );

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Hyperspeed effectOptions={hyperspeedOptions} />

            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                pointerEvents: 'none',
                overflowY: 'auto' // Allow scrolling if content is tall
            }}>

                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    padding: '4rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'auto', // Enable interaction for content
                    minHeight: '100vh', // Ensure full height for vertical centering
                    justifyContent: 'center'
                }}>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <h1 style={{
                            fontSize: 'clamp(3rem, 8vw, 6rem)',
                            fontWeight: '900',
                            color: 'transparent',
                            WebkitTextStroke: '2px rgba(255,255,255,0.8)',
                            marginBottom: '1rem',
                            letterSpacing: '0.05em',
                            fontFamily: '"Exo 2", sans-serif',
                            textShadow: '0 0 30px rgba(3, 179, 195, 0.5)'
                        }}>
                            MIND MATRIX
                        </h1>
                        <p style={{
                            fontSize: '1.25rem',
                            color: 'rgba(255,255,255,0.8)',
                            marginBottom: '3rem',
                            maxWidth: '600px',
                            lineHeight: '1.6',
                            margin: '0 auto'
                        }}>
                            Next-generation emotional intelligence in a conversational AI interface.
                            Experience the future today.
                        </p>

                        <button
                            onClick={handleEnter}
                            className="enter-button" // Used class for complex hover states if needed, else inline style
                            style={{
                                padding: '1.2rem 3.5rem',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: '#000',
                                background: '#fff',
                                border: 'none',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(255,255,255,0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 40px rgba(255,255,255,0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.4)';
                            }}
                        >
                            Enter The Matrix
                        </button>
                    </motion.div>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '1rem',
                        width: '100%',
                        marginTop: '2rem'
                    }}>
                        <FeatureCard
                            icon={Brain}
                            title="Emotional IQ"
                            description="Advanced sentiment analysis that understands not just what you say, but how you feel."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={Activity}
                            title="Real-time Analytics"
                            description="Visualize conversation dynamics and emotional trends as they happen."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Secure & Private"
                            description="Enterprise-grade encryption ensures your conversations remain completely private."
                            delay={0.6}
                        />
                    </div>

                    <motion.footer
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        style={{
                            marginTop: 'auto',
                            paddingTop: '4rem',
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}
                    >
                        © 2024 Mind Matrix. All rights reserved.
                    </motion.footer>

                </div>
            </div>
        </div>
    );
};

export default LandingPage;
