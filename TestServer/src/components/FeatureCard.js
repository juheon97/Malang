import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import '../styles/FeatureCard.css';

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10 }}
    >
      <Card className="feature-card">
        <CardContent>
          <Box className="feature-icon-container">
            {icon}
          </Box>
          <Typography variant="h6" component="div" className="feature-title">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="feature-description">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
