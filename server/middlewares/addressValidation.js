// middlewares/addressValidation.js
const validateAddress = (req, res, next) => {
  const { addressType, building, locality, contactName } = req.body;
  
  if (!addressType || !building || !locality || !contactName) {
    return res.status(400).json({ 
      msg: 'Missing required fields: addressType, building, locality, contactName' 
    });
  }
  
  if (addressType === 'Other' && !req.body.customName) {
    return res.status(400).json({ 
      msg: 'Custom name required for "Other" address type' 
    });
  }
  
  next();
};

module.exports = validateAddress;