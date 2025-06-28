import React, { useEffect, useRef } from "react";
import { Container, Title, Text, Grid, Card, Button, Group, ThemeIcon, List, Box, Paper, Anchor, SimpleGrid, Stack, Image } from "@mantine/core";
import { IconHomeBolt, IconFlame, IconShieldLock, IconLockAccess, IconDeviceMobile, IconBulb, IconBellRinging, IconUsers, IconMail, IconPhone, IconMapPin } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const Landing = () => {
  const featuresRef = useRef(null);
  const contactRef = useRef(null);
  const location = useLocation()
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(()=>{
    if(location.hash === "#home"){
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    }
    if(location.hash === "#features"){
      scrollToSection(featuresRef)
    }
    if(location.hash === "#contact"){
      scrollToSection(contactRef)
    }
  },[location])

  const featureData = [
    {
      icon: <IconHomeBolt size={40} color="var(--mantine-color-blue-6)" />,
      title: "Smart Home Integration",
      description: "Experience the future of living with our fully integrated smart homes. Control lighting, climate, and more with ease.",
      points: [
        "Centralized mobile application for all smart features",
        "Voice-activated commands for hands-free control",
        "Customizable lighting scenes to match your mood",
        "Energy-efficient smart thermostats for optimal comfort"
      ]
    },
    {
      icon: <IconFlame size={40} color="var(--mantine-color-red-6)" />,
      title: "Advanced Fire & Gas Alerts",
      description: "Your safety is paramount. Our homes are equipped with state-of-the-art alert systems for immediate detection and notification.",
      points: [
        "Sensitive smoke and heat detectors",
        "Carbon monoxide and natural gas leak sensors",
        "Instant alerts to your mobile device and central security",
        "Integrated with emergency response services"
      ]
    },
    {
      icon: <IconShieldLock size={40} color="var(--mantine-color-green-6)" />,
      title: "Comprehensive Security Systems",
      description: "Rest easy knowing your home and community are protected by robust, multi-layered security measures.",
      points: [
        "24/7 CCTV surveillance across the compound",
        "Perimeter security and controlled access points",
        "On-site security personnel and rapid response team",
        "Secure parking with license plate recognition"
      ]
    },
    {
      icon: <IconLockAccess size={40} color="var(--mantine-color-yellow-6)" />,
      title: "Intelligent Access Control",
      description: "Seamless and secure entry for residents and guests, powered by cutting-edge technology.",
      points: [
        "Facial recognition entry systems for residents",
        "Smart doorbells with video and two-way audio",
        "Guest access management via mobile app",
        "Secure package delivery solutions"
      ]
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Box style={{ position: 'relative', minHeight: '80vh', overflow: 'hidden' }}>
  {/* Background Carousel */}
  <Box style={{
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
  }}>
    <Carousel
      autoPlay
      infiniteLoop
      interval={3000}
      showThumbs={false}
      showStatus={false}
      showArrows={false}
      stopOnHover={false}
      swipeable={false}
      emulateTouch={false}
      dynamicHeight={false}
    >
      <div><img src="/img1.jpg" alt="Slide 1" style={{ height: '100vh', objectFit: 'cover' }} /></div>
      <div><img src="/img2.jpg" alt="Slide 2" style={{ height: '100vh', objectFit: 'cover' }} /></div>
      <div><img src="/img4.jpg" alt="Slide 4" style={{ height: '100vh', objectFit: 'cover', objectPosition: 'center 80%' }} /></div>
      <div><img src="/img5.jpg" alt="Slide 5" style={{ height: '100vh', objectFit: 'cover' }} /></div>
    </Carousel>
  </Box>

  {/* Foreground content */}
  
</Box>


      {/* Features Section */}
      <Box ref={featuresRef} py={80} bg="var(--mantine-color-gray-0)" className="features-section"> 
        <Container>
          <Title order={2} align="center" mb={50} style={{ fontSize: '2.5rem' }}>
            Live Smarter, Live Safer
          </Title>
          <Grid gutter="xl">
            {featureData.map((feature, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 6 }}>
                <Card shadow="sm" p="xl" radius="md" withBorder h="100%">
                  <Group align="flex-start" wrap="nowrap" mb="md">
                    <ThemeIcon size={60} radius="md" variant="light" color={feature.icon.props.color.split('-')[2]}> 
                      {feature.icon}
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Title order={3} style={{ marginBottom: '0.5rem' }}>{feature.title}</Title>
                      <Text c="dimmed" size="sm">{feature.description}</Text>
                    </Box>
                  </Group>
                  <List
                    spacing="xs"
                    size="sm"
                    center
                    icon={
                      <ThemeIcon color="teal" size={18} radius="xl">
                        <IconBulb size={12} />
                      </ThemeIcon>
                    }
                  >
                    {feature.points.map((point, pIndex) => (
                      <List.Item key={pIndex}>{point}</List.Item>
                    ))}
                  </List>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Footer Section */}
      <Box ref={contactRef} component="footer" py={60} bg="var(--mantine-color-dark-7)" c="white" className="footer-section">
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            <div>
              <Title order={4} mb="md">MOSTAQBAL City</Title>
              <Text size="sm" c="dimmed">
                Experience modern living with unparalleled security and smart home technology.
              </Text>
            </div>
            <div>
              <Title order={5} mb="sm">Quick Links</Title>
              <Stack gap="xs">
                <Anchor c="dimmed" href="#" onClick={(e) => { e.preventDefault(); scrollToSection(featuresRef); }} size="sm">Features</Anchor>
                <Anchor c="dimmed" href="#" onClick={(e) => e.preventDefault()} size="sm">Gallery</Anchor> {/* Placeholder */}
                <Anchor c="dimmed" href="#" onClick={(e) => e.preventDefault()} size="sm">Floor Plans</Anchor> {/* Placeholder */}
                <Anchor c="dimmed" href="/login" size="sm">Resident Portal</Anchor>
              </Stack>
            </div>
            <div>
              <Title order={5} mb="sm">Legal</Title>
              <Stack gap="xs">
                <Anchor c="dimmed" href="#" onClick={(e) => e.preventDefault()} size="sm">Privacy Policy</Anchor>
                <Anchor c="dimmed" href="#" onClick={(e) => e.preventDefault()} size="sm">Terms of Service</Anchor>
              </Stack>
            </div>
            <div>
              <Title order={5} mb="sm">Contact Us</Title>
              <Stack gap="sm">
                <Group wrap="nowrap" gap="xs">
                  <ThemeIcon size="sm" variant="transparent" color="gray"><IconMail size={16} /></ThemeIcon>
                  <Anchor href="mailto:momen.elshahydie@gmail.com" size="sm" c="dimmed">momen.elshahydie@gmail.com</Anchor>
                </Group>
                <Group wrap="nowrap" gap="xs">
                  <ThemeIcon size="sm" variant="transparent" color="gray"><IconPhone size={16} /></ThemeIcon>
                  <Anchor href="tel:+201200063396" size="sm" c="dimmed">+201200063396</Anchor>
                </Group>
                <Group wrap="nowrap" gap="xs">
                  <ThemeIcon size="sm" variant="transparent" color="gray"><IconMapPin size={16} /></ThemeIcon>
                  <Text size="sm" c="dimmed">Government street, Zagazig, Sharkia</Text>
                </Group>
              </Stack>
            </div>
          </SimpleGrid>
          <Text ta="center" c="dimmed" size="sm" mt={50}>
            © {new Date().getFullYear()} MOSTAQBAL City. All rights reserved.
          </Text>
        </Container>
      </Box>
    </>
  );
};

export default Landing;
