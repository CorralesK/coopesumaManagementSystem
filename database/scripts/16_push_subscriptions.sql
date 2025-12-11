-- ============================================================================
-- TABLA: push_subscriptions
-- Descripción: Almacena las suscripciones de push notifications por usuario/dispositivo
-- ============================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Un usuario puede tener múltiples dispositivos, pero cada endpoint es único
    CONSTRAINT unique_endpoint UNIQUE (endpoint)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

COMMENT ON TABLE push_subscriptions IS 'Suscripciones de push notifications por usuario/dispositivo';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL del endpoint de push del navegador';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Clave pública del cliente para cifrado';
COMMENT ON COLUMN push_subscriptions.auth IS 'Secreto de autenticación del cliente';