import React, { useState, useEffect } from 'react';
import { useDeriv } from '../context/DerivContext';
import { Mail, ShieldCheck, UserPlus, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const AccountCreation = ({ onCancel }) => {
  const { verifyEmail, createVirtualAccount, verificationStatus, clearVerificationStatus } = useDeriv();
  const [step, setStep] = useState(1); // 1: Email, 2: Token, 3: Password/Residence
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [residence, setResidence] = useState('ke'); // Default to Kenya or detect
  const [success, setSuccess] = useState(false);

  // Sync steps with verification status
  useEffect(() => {
    if (verificationStatus.sent && step === 1) {
      setStep(2);
    }
  }, [verificationStatus.sent, step]);

  const handleSendEmail = (e) => {
    e.preventDefault();
    clearVerificationStatus();
    verifyEmail(email.trim(), 'account_opening');
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    createVirtualAccount({
      verification_code: verificationCode,
      client_password: password,
      residence: residence,
    });
    // handleMessage in Context will handle success/redirect
  };

  if (success) {
    return (
      <div className="glass flex-center" style={{ flexDirection: 'column', padding: '60px', borderRadius: '24px', textAlign: 'center', gap: '20px' }}>
        <CheckCircle2 size={64} color="var(--success)" />
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Account Created!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to Deriv.X. Redirecting to your new dashboard...</p>
      </div>
    );
  }

  return (
    <div className="account-creation-container animate-fade-in" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div className="logo-icon" style={{ width: '48px', height: '48px', background: 'var(--accent-blue)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <UserPlus size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Create Virtual Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Start trading with $10,000 virtual balance.</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  style={{ width: '100%', paddingLeft: '48px' }}
                />
              </div>
              {verificationStatus.error && (
                <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{verificationStatus.error}</p>
              )}
            </div>
            <button className="btn-primary" type="submit" disabled={verificationStatus.loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              {verificationStatus.loading ? 'Sending Code...' : 'Get Verification Code'} <ArrowRight size={18} />
            </button>
            <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
              Cancel
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Verification Code</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Enter the code sent to your email" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required 
                  style={{ width: '100%', paddingLeft: '48px' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Check your inbox (and spam) for the code.</p>
            </div>
            <button className="btn-primary" type="submit" style={{ width: '100%' }}>Continue</button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ArrowLeft size={16} /> Use different email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Password</label>
              <input 
                type="password" 
                placeholder="Secure password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ width: '100%' }}
              />
            </div>
            {verificationStatus.error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{verificationStatus.error}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Country of Residence</label>
              <select 
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 16px', borderRadius: '10px', 
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white',
                  outline: 'none'
                }}
              >
                <option value="ke">Kenya</option>
                <option value="gh">Ghana</option>
                <option value="ng">Nigeria</option>
                <option value="za">South Africa</option>
                <option value="id">Indonesia</option>
                <option value="vn">Vietnam</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" disabled={verificationStatus.loading} style={{ width: '100%' }}>
              {verificationStatus.loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountCreation;
