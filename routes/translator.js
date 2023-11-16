

const express = require('express');
const {languageTranslator,languageDetector} = require('../controller/translator');
const casheMiddleware=require('../middleware/redisMidleware')
const router = express.Router();


const englishLanguage=require('../middleware/enTranslator')
const norwayLanguage=require('../middleware/noTranslator')
router.get('/translation',englishLanguage,norwayLanguage,languageTranslator);

router.get('/',casheMiddleware,languageDetector);

module.exports = router;