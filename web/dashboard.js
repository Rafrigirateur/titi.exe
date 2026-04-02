import express from 'express';
import { maledictionManager } from '../features/malediction.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Middleware pour vérifier le PIN sur les routes API
function checkPin(req, res, next) {
    const userPin = req.body.pin || req.headers['x-pin'];
    if (userPin === process.env.DASHBOARD_PIN) {
        next();
    } else {
        res.status(401).json({ error: 'Code PIN invalide' });
    }
}

// Route pour fournir l'état actuel au dashboard
router.get('/api/status', (req, res) => {
    res.json({
        isActive: maledictionManager.isActive,
        allowedChannels: maledictionManager.allowedChannels
    });
});

// Route pour modifier la configuration (protégée par PIN)
router.post('/api/config', checkPin, (req, res) => {
    const { isActive, channels } = req.body;
    maledictionManager.updateConfig(isActive, channels);
    res.json({ success: true, message: 'Configuration mise à jour !' });
});

// Sert les fichiers statiques (le HTML du dashboard)
router.use('/', express.static(path.join(__dirname, 'public')));

export default router;