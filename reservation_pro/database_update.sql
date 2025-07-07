-- Script de mise à jour de la base de données pour ajouter les nouveaux champs à la table paiement
-- Exécutez ce script dans votre base de données PostgreSQL

-- Ajouter les nouveaux champs à la table paiement
ALTER TABLE paiement 
ADD COLUMN IF NOT EXISTS montant_paiement DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'Payée',
ADD COLUMN IF NOT EXISTS method VARCHAR(100);

-- Mettre à jour les enregistrements existants si nécessaire
UPDATE paiement 
SET montant_paiement = 0.00, 
    status = 'Payée', 
    method = 'Carte bancaire' 
WHERE montant_paiement IS NULL OR status IS NULL;

-- Vérifier que les contraintes sont correctes
COMMENT ON COLUMN paiement.montant_paiement IS 'Montant du paiement en FCFA';
COMMENT ON COLUMN paiement.status IS 'Statut du paiement (Payée, En attente, Remboursé)';
COMMENT ON COLUMN paiement.method IS 'Méthode de paiement (Carte bancaire, Moov Money, MTN Mobile Money)'; 