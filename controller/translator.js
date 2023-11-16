const mongoose = require("mongoose");
const casheMiddleware = require('../middleware/redisMidleware')
const Redis = require('redis')

exports.languageTranslator = async (req, res, next) => {

  res.status(200).json({
    success: true,
    english: JSON.parse(req.languageEnglish),
    norway: JSON.parse(req.norwayLanguage),
  })
}

exports.languageDetector = async (req, res, next) => {

  res.status(200).json({
    success: true,
    language: JSON.parse(req.language)
  })
}

