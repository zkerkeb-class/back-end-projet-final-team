const express = require('express');
const router = express.Router();
const jamRoomController = require('../controllers/jamRoom.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Jam Sessions
 *   description: API endpoints pour la gestion des jam sessions en temps réel
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JamRoom:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: L'identifiant unique de la salle
 *         name:
 *           type: string
 *           description: Le nom de la salle de jam
 *         description:
 *           type: string
 *           description: Description de la session de jam
 *         status:
 *           type: string
 *           enum: [active, closed]
 *           description: Le statut de la salle
 *         maxParticipants:
 *           type: integer
 *           minimum: 2
 *           maximum: 50
 *           description: Nombre maximum de participants autorisés
 *         createdBy:
 *           type: integer
 *           description: ID de l'utilisateur qui a créé la salle
 */

// Protect all routes with authentication
router.use(authenticate);

/**
 * @swagger
 * /api/jam-rooms:
 *   post:
 *     summary: Créer une nouvelle salle de jam
 *     tags: [Jam Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               maxParticipants:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 50
 *     responses:
 *       201:
 *         description: Salle de jam créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JamRoom'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.post('/', jamRoomController.createRoom.bind(jamRoomController));

/**
 * @swagger
 * /api/jam-rooms:
 *   get:
 *     summary: Récupérer toutes les salles de jam actives
 *     tags: [Jam Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des salles de jam actives
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JamRoom'
 *       401:
 *         description: Non authentifié
 */
router.get('/', jamRoomController.getRooms.bind(jamRoomController));

/**
 * @swagger
 * /api/jam-rooms/{roomId}:
 *   get:
 *     summary: Récupérer les détails d'une salle de jam
 *     tags: [Jam Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la salle de jam
 *     responses:
 *       200:
 *         description: Détails de la salle de jam
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JamRoom'
 *       404:
 *         description: Salle non trouvée
 *       401:
 *         description: Non authentifié
 */
router.get('/:roomId', jamRoomController.getRoom.bind(jamRoomController));

/**
 * @swagger
 * /api/jam-rooms/{roomId}/close:
 *   put:
 *     summary: Fermer une salle de jam
 *     tags: [Jam Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la salle de jam
 *     responses:
 *       200:
 *         description: Salle fermée avec succès
 *       403:
 *         description: Non autorisé (seul le créateur peut fermer la salle)
 *       404:
 *         description: Salle non trouvée
 *       401:
 *         description: Non authentifié
 */
router.put(
  '/:roomId/close',
  jamRoomController.closeRoom.bind(jamRoomController),
);

/**
 * @swagger
 * /api/jam-rooms/{roomId}/participant:
 *   put:
 *     summary: Mettre à jour les informations d'un participant
 *     tags: [Jam Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la salle de jam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instrument:
 *                 type: string
 *                 description: L'instrument joué par le participant
 *     responses:
 *       200:
 *         description: Informations du participant mises à jour
 *       404:
 *         description: Participant non trouvé
 *       401:
 *         description: Non authentifié
 */
router.put(
  '/:roomId/participant',
  jamRoomController.updateParticipant.bind(jamRoomController),
);

module.exports = router;
