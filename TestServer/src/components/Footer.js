import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <Box component="footer" className="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" className="footer-title">
              VoiceAI
            </Typography>
            <Typography variant="body2" className="footer-description">
              최첨단 AI 음성 기술로 당신의 디지털 경험을 향상시켜 드립니다.
            </Typography>
            <Box className="social-icons">
              <IconButton color="primary"><FacebookIcon /></IconButton>
              <IconButton color="primary"><TwitterIcon /></IconButton>
              <IconButton color="primary"><LinkedInIcon /></IconButton>
              <IconButton color="primary"><InstagramIcon /></IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" className="footer-section-title">
              서비스
            </Typography>
            <ul className="footer-links">
              <li><Link href="#">음성 인식</Link></li>
              <li><Link href="#">텍스트 변환</Link></li>
              <li><Link href="#">AI 어시스턴트</Link></li>
              <li><Link href="#">음성 분석</Link></li>
            </ul>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" className="footer-section-title">
              회사
            </Typography>
            <ul className="footer-links">
              <li><Link href="#">소개</Link></li>
              <li><Link href="#">블로그</Link></li>
              <li><Link href="#">채용</Link></li>
              <li><Link href="#">연락처</Link></li>
            </ul>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" className="footer-section-title">
              지원
            </Typography>
            <ul className="footer-links">
              <li><Link href="#">도움말</Link></li>
              <li><Link href="#">FAQ</Link></li>
              <li><Link href="#">개발자</Link></li>
              <li><Link href="#">API 문서</Link></li>
            </ul>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" className="footer-section-title">
              법적 정보
            </Typography>
            <ul className="footer-links">
              <li><Link href="#">개인정보 처리방침</Link></li>
              <li><Link href="#">이용약관</Link></li>
              <li><Link href="#">쿠키 정책</Link></li>
            </ul>
          </Grid>
        </Grid>
        
        <Box className="footer-bottom">
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} VoiceAI. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
