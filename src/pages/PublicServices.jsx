import { useState, useEffect } from "react";
import {
  Card,
  Text,
  Stack,
  Group,
  Title,
  Badge,
  Alert,
  Accordion,
} from "@mantine/core";
import { publicServicesService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function PublicServices() {
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPublicServicesData();
  }, []);

  const fetchPublicServicesData = async () => {
    try {
      setLoading(true);
      const response = await publicServicesService.getPublicServices();
      setCategoriesData(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch public services:", err);
      setError("Failed to load public services. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "green";
      case "unavailable":
        return "red";
      case "limited":
        return "yellow";
      default:
        return "blue";
    }
  };

  return (
    <Stack>
      <Title order={2}>Public Services</Title>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Text>Loading public services...</Text>
      ) : categoriesData.length === 0 ? (
        <Text ta="center">No public services available.</Text>
      ) : (
        <Stack>
          {categoriesData.map((category) => (
            <Card
              key={category.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Title order={3} mb="sm">
                {category.name}
              </Title>
              <Text c="dimmed" mb="md">
                {category.description}
              </Text>
              {category.services && category.services.length > 0 ? (
                <Accordion>
                  <Accordion.Item value={category.id.toString()}>
                    <Accordion.Control>
                      Show List{" "}
                      <Badge color={getStatusColor("active")} variant="light">
                        {
                          category.services.filter(
                            (service) => service.status === "Active"
                          ).length
                        }
                      </Badge>
                      <Badge color={getStatusColor("limited")} variant="light">
                        {
                          category.services.filter(
                            (service) => service.status === "Limited"
                          ).length
                        }
                      </Badge>
                      <Badge
                        color={getStatusColor("unavailable")}
                        variant="light"
                      >
                        {
                          category.services.filter(
                            (service) => service.status === "Unavailable"
                          ).length
                        }
                      </Badge>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Accordion
                        defaultValue={
                          [] /* Or a specific service ID to open by default */
                        }
                        chevronPosition="left"
                      >
                        {category.services.map((service) => (
                          <Accordion.Item
                            key={service.id}
                            value={service.id.toString()}
                          >
                            <Accordion.Control>
                              <Group>
                                <Text fw={500}>{service.name}</Text>
                                <Badge
                                  color={getStatusColor(service.status)}
                                  variant="light"
                                >
                                  {service.status}
                                </Badge>
                              </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                              <Stack ps={"1rem"}>
                                <Group>
                                  <Text fw={500}>Phone:</Text>
                                  <Text>{service.phone_number}</Text>
                                </Group>
                                <Group>
                                  <Text fw={500}>Created:</Text>
                                  <Text size="sm" c="dimmed">
                                    {new Date(
                                      service.created_at
                                    ).toLocaleString()}
                                  </Text>
                                </Group>
                                <Group>
                                  <Text fw={500}>Last Updated:</Text>
                                  <Text size="sm" c="dimmed">
                                    {new Date(
                                      service.updated_at
                                    ).toLocaleString()}
                                  </Text>
                                </Group>
                              </Stack>
                            </Accordion.Panel>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              ) : (
                <Text>No services available in this category.</Text>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
