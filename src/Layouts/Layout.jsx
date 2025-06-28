import { useState } from "react";
import {
  Outlet,
  NavLink as Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Button,
  Title,
  Text,
  Divider,
  Box,
  Flex,
} from "@mantine/core";
import { useAuth } from "../contexts/AuthContext";
import "./Layout.css";

export default function Layout() {
  const [opened, setOpened] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: {
          mobile: !opened ,
          desktop: !opened ,
        },
      }}
      padding={location.pathname !== "/" ? "md" : ""}
    >
      {/* <AppShell.Header className="app-header" h={60}>
        <Group justify="space-between" h="100%">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={3} visibleFrom="xs" className="app-title">Neighborhood Forum</Title>
            <Title order={3} hiddenFrom="xs" className="app-title">NF</Title>
          </Group>
          <Group>
            {currentUser ? (
              <>
                <Text size="sm" visibleFrom="xs" className="user-welcome">Welcome, {currentUser.username}</Text>
                <Button variant="light" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button variant="light" component={Link} to="/login">Login</Button>
            )}
          </Group>
        </Group>
      </AppShell.Header> */}
      <AppShell.Header className="app-header" h={60}>
        <Group justify="space-between" h="100%" px="md" w="100%">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              // hiddenFrom="sm"
              size="sm"
            />
            <Link to="/">
            <Title order={3} className="app-title" visibleFrom="xs">
              MOSTAQBAL City
            </Title>
            <Title order={3} className="app-title" hiddenFrom="xs">
              MC
            </Title>
            </Link>
          </Group>

          <Flex gap="1px" visibleFrom="sm" mr="md">
            <Link
              to={{ pathname: "/", hash: "home" }}
              className={(isActive) => {
                return isActive && location.hash === "#home" ? "nav-link-text active" : "nav-link-text";
              }}
            >
              Home
            </Link>
            <Link
              to={{ pathname: "/", hash: "features" }}
              className={(isActive) => {
                return isActive && location.hash === "#features" ? "nav-link-text active" : "nav-link-text";
              }}
              onClick={() => {
                console.log(location.hash);
                
              }}
            >
              Features
            </Link>
            <Link
              to={{ pathname: "/", hash: "contact" }}
              className={(isActive) => {
                return isActive && location.hash === "#contact" ? "nav-link-text active" : "nav-link-text";
              }}
            >
              Contact
            </Link>
          </Flex>
          <Group>
            {currentUser ? (
              <>
                <Text size="sm" visibleFrom="xs" className="user-welcome">
                  Welcome, {currentUser.username}
                </Text>
                <Button variant="light" onClick={handleLogout}>
                  Logout
                </Button>
                {/* <Button variant="filled" component={Link} to="/">
            Dashboard
          </Button> */}
              </>
            ) : (
              <>
              <Button variant="light" component={Link} to="/login">
                Login
              </Button>
              <Button variant="light" component={Link} to="/register">
                Register
              </Button>
            </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

        <AppShell.Navbar p="md" className="app-navbar">
      {currentUser ? (
          <>
            <NavLink
              onClick={()=>{setOpened(false)}}
              label="Chat"
              component={Link}
              to="/chat"
              active={location.pathname === "/chat"}
              className="nav-link"
            />
            <NavLink
              onClick={()=>{setOpened(false)}}
              label="Public Services"
              component={Link}
              to="/public-services"
              active={location.pathname === "/public-services"}
              className="nav-link"
            />
            <NavLink
              onClick={()=>{setOpened(false)}}
              label="Advertisements"
              component={Link}
              to="/advertisements"
              active={location.pathname === "/advertisements"}
              className="nav-link"
            />
            <NavLink
              onClick={()=>{setOpened(false)}}
              label="Admin Chat"
              component={Link}
              to="/messages"
              active={location.pathname === "/messages"}
              className="nav-link"
            />
            {currentUser.is_admin && (
              <>
                <Divider
                  my="sm"
                  label="Admin"
                  labelPosition="center"
                  className="admin-divider"
                />
                <NavLink
                  onClick={()=>{setOpened(false)}}
                  label="Pending Approvals"
                  component={Link}
                  to="/admin/pending"
                  active={location.pathname === "/admin/pending"}
                  className="nav-link"
                />
                <NavLink
                  onClick={()=>{setOpened(false)}}
                  label="Manage Users"
                  component={Link}
                  to="/admin/users"
                  active={location.pathname === "/admin/users"}
                  className="nav-link"
                />
                <NavLink
                  onClick={()=>{setOpened(false)}}
                  label="Manage Public Services"
                  component={Link}
                  to="/admin/public-services"
                  active={location.pathname === "/admin/public-services"}
                  className="nav-link"
                />
              </>
            )}
          </>
      ) : (
        <>
        <NavLink
        onClick={()=>{setOpened(false)}}
        label="Login"
        component={Link}
        to="/login"
        active={location.pathname ==="/login"}
        className="nav-link"
        />
        <NavLink
        onClick={()=>{setOpened(false)}}
        label="Register"
        component={Link}
        to="/register"
        active={location.pathname ==="/register"}
        className="nav-link"
        />
        </>
      )}
        </AppShell.Navbar>

      {/* // (
        // <>
        //     <NavLink
        //       label="Login"
        //       component={Link}
        //       to="/login"
        //       active={location.pathname === "/login"}
        //       className="nav-link"
        //     />
        //     <NavLink
        //       label="Register"
        //       component={Link}
        //       to="/register"
        //       active={location.pathname === "/register"}
        //       className="nav-link"
        //     />
        //   </>
        // )} */}

      <AppShell.Main className="app-main">
        <Box>
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
