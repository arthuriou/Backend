-- Table pour la vérification OTP
CREATE TABLE IF NOT EXISTS otp_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verification(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verification(expires_at);
