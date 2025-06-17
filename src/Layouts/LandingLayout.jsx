import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AppShell, Burger, Group, NavLink, Button, Title, Box, Text, Flex } from '@mantine/core';
import './Layout.css';

export default function LandingLayout() {
  const [opened, setOpened] = useState(false);
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header className="app-header" h={60}>
        <Group justify="space-between" h="100%" px="md" w="100%">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={3} className="app-title">MOSTAQBAL City</Title>
          </Group>
          
          <Flex gap="md" visibleFrom="sm" mr="md">
            <Text 
              component="span" 
              className="nav-link-text"
              onClick={() => {
                const homeSection = document.querySelector('.landing-section');
                if (homeSection) homeSection.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                cursor: 'pointer',
                fontWeight: 500,
                
              }}
            >
              Home
            </Text>
            <Text 
              component="span" 
              className="nav-link-text"
              onClick={() => {
                const sections = document.querySelectorAll('.landing-section');
                if (sections.length > 1) sections[1].scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              About
            </Text>
            <Text 
              component="span" 
              className="nav-link-text"
              onClick={() => {
                const sections = document.querySelectorAll('.landing-section');
                if (sections.length > 2) sections[2].scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Amenities
            </Text>
            <Text 
              component="span" 
              className="nav-link-text"
              onClick={() => {
                const sections = document.querySelectorAll('.landing-section');
                if (sections.length > 3) sections[3].scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Contact
            </Text>
          </Flex>
          
          <Button variant="filled" component={Link} to="/">
            Dashboard
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className="app-navbar">
        <NavLink
          label="Home"
          onClick={() => {
            setOpened(false);
            setTimeout(() => {
              const homeSection = document.querySelector('.landing-section');
              if (homeSection) homeSection.scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }}
          className="nav-link"
        />
        <NavLink
          label="About"
          onClick={() => {
            setOpened(false);
            setTimeout(() => {
              const sections = document.querySelectorAll('.landing-section');
              if (sections.length > 1) sections[1].scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }}
          className="nav-link"
        />
        <NavLink
          label="Amenities"
          onClick={() => {
            setOpened(false);
            setTimeout(() => {
              const sections = document.querySelectorAll('.landing-section');
              if (sections.length > 2) sections[2].scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }}
          className="nav-link"
        />
        <NavLink
          label="Contact"
          onClick={() => {
            setOpened(false);
            setTimeout(() => {
              const sections = document.querySelectorAll('.landing-section');
              if (sections.length > 3) sections[3].scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }}
          className="nav-link"
        />
      </AppShell.Navbar>

      <AppShell.Main className="app-main">
        <Box py="md">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
