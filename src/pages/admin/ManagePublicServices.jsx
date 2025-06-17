import { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  Stack,
  Group,
  Title,
  Alert,
  Table,
  TextInput,
  Textarea,
  Select,
  Modal,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { publicServicesService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ManagePublicServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpened, setModalOpened] = useState(false);
  const [categoryModalOpened, setCategoryModalOpened] = useState(false);

  const [editingService, setEditingService] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: "",
      
      phone_number: "",
      status: "Active",
      category:""
    },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      
      phone_number: (value) => (value ? null : "Phone number is required"),
      status: (value) => (value ? null : "Status is required"),
      category: (value) => (value ? null : "Category is required"),
    },
    transformValues: (values) => ({
      ...values,
      category: Number(values.category),
    }),
  });

  const categoryForm = useForm({
    initialValues: {
      name: "",
      id: "",
      description: "",
    },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      description: (value) => (value ? null : "Description is required"),
    },
  });
  useEffect(() => {
    // Only admin can access this page
    if (!currentUser?.is_admin) {
      navigate("/");
      return;
    }

    fetchPublicServices();
    fetchPublicServiceCategories();
  }, [currentUser, navigate]);

  const fetchPublicServices = async () => {
    try {
      setLoading(true);
      const response = await publicServicesService.getPublicServices();
      setServices(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch public services:", err);
      setError("Failed to load public services. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicServiceCategories = async () => {
    try {
      setLoading(true);
      const response = await publicServicesService.getPublicServiceCategories();
      setCategories(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch public service categories:", err);
      setError(
        "Failed to load public service categories. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (values) => {
    try {
      await publicServicesService.createPublicService(values);
      form.reset();
      setModalOpened(false);
      fetchPublicServices();
    } catch (err) {
      console.error("Failed to create public service:", err);
      setError("Failed to create public service. Please try again.");
    }
  };

  const handleUpdateService = async (values) => {
    try {
      await publicServicesService.updatePublicService(
        editingService.id,
        values
      );
      form.reset();
      setModalOpened(false);
      setEditingService(null);
      fetchPublicServices();
    } catch (err) {
      console.error("Failed to update public service:", err);
      setError("Failed to update public service. Please try again.");
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await publicServicesService.deletePublicService(serviceId);
      fetchPublicServices();
    } catch (err) {
      console.error("Failed to delete public service:", err);
      setError("Failed to delete public service. Please try again.");
    }
  };

  const openCreateModal = (category) => {
    form.reset();
    setEditingService(null);
    if (typeof category === "number") {
      form.setValues({
        category: category.toString(),
      });
    }
    setModalOpened(true);
  };

  const openEditModal = (service) => {
    form.setValues({
      name: service.name,
      description: service.description,
      phone_number: service.phone_number,
      status: service.status,
      category: service.category.toString(),
    });
    setEditingService(service);
    setModalOpened(true);
  };

  const openCreateCategoryModal = () => {
    categoryForm.reset();
    setEditingCategory(null);
    setCategoryModalOpened(true);
  };

  const openEditCategoryModal = (category) => {
    categoryForm.setValues({
      id: category.id,
      name: category.name,
      description: category.description,
    });
    setEditingCategory(category);
    setCategoryModalOpened(true);
  };

  const handleCreateCategory = async (values) => {
    try {
      await publicServicesService.createPublicServiceCategory(values);
      categoryForm.reset();
      setCategoryModalOpened(false);
      fetchPublicServiceCategories();
    } catch (err) {
      console.error("Failed to create public service category:", err);
      setError("Failed to create public service category. Please try again.");
    }
  };

  const handleUpdateCategory = async (values) => {
    try {
      await publicServicesService.updatePublicServiceCategory(
        editingCategory.id,
        values
      );
      categoryForm.reset();
      setCategoryModalOpened(false);
      setEditingCategory(null);
      fetchPublicServiceCategories();
    } catch (err) {
      console.error("Failed to update public service category:", err);
      setError("Failed to update public service category. Please try again.");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const result = await confirm(
      "Are you sure you want to delete this category?"
    );
    if (!result) return;
    try {
      await publicServicesService.deletePublicServiceCategory(categoryId);
      fetchPublicServiceCategories();
    } catch (err) {
      console.error("Failed to delete public service category:", err);
      setError("Failed to delete public service category. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Stack spacing="lg">
      <Group justify="space-between">
        <Title order={2}>Manage Public Services</Title>
        <Group>
          <Button variant="outline" onClick={openCreateCategoryModal}>
            Add New Category
          </Button>
          <Button variant="outline" onClick={openCreateModal}>
            Add New Service
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Text>Loading public services...</Text>
      ) : services.length === 0 ? (
        <Text ta="center">No public services found.</Text>
      ) : (
        categories.map((category) => (
          <Box key={category.id} style={{boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",borderRadius:"8px",padding:"1rem",margin:"1rem",backgroundColor:"#f5f5f5"}}>
            <Group justify="space-between">
              <Title order={4}>{category.name}</Title>
              <Group >
                <Button
                  variant="outline"
                  onClick={() => openEditCategoryModal(category)}
                >
                  Edit Category
                </Button>
                <Button
                  color="red"
                  variant="outline"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete Category
                </Button>
              </Group>
            </Group>
            <Text>{category.description}</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Phone Number</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Last Updated</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {services
                  .find((serviceCategory) => serviceCategory.id === category.id)
                  ?.services.map((service) => (
                    <Table.Tr key={service.id}>
                      <Table.Td>{service.name}</Table.Td>
                      <Table.Td>{service.phone_number}</Table.Td>
                      <Table.Td>{service.status}</Table.Td>
                      <Table.Td>{formatDate(service.updated_at)}</Table.Td>
                      <Table.Td>
                        <Group>
                          <Button
                            size="xs"
                            variant="outline"
                            color="blue"
                            onClick={() => openEditModal(service)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            color="red"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            Delete
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                <Table.Tr>
                  <Table.Td colSpan={4}></Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      color="blue"
                      variant="outline"
                      onClick={() => openCreateModal(category.id)}
                    >
                      Add New Service
                    </Button>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Box>
        ))
      )}

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          editingService ? "Edit Public Service" : "Add New Public Service"
        }
      >
        <form
          onSubmit={form.onSubmit(
            editingService ? handleUpdateService : handleCreateService
          )}
        >
          <Stack>
            <TextInput
              label="Name"
              placeholder="Service name"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Phone Number"
              placeholder="Contact phone number"
              maxLength={11}
              required
              {...form.getInputProps("phone_number")}
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={categories.map((category) => ({
                value: category.id.toString(),
                label: category.name,
              }))}
              required
              {...form.getInputProps("category")}
            />
            <Select
              label="Status"
              placeholder="Select status"
              data={[
                { value: "Active", label: "Active" },
                { value: "Unavailable", label: "Unavailable" },
                { value: "Limited", label: "Limited" },
              ]}
              required
              {...form.getInputProps("status")}
            />
            <Group position="right" mt="md">
              <Button variant="subtle" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingService ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Modal
        opened={categoryModalOpened}
        onClose={() => setCategoryModalOpened(false)}
        title="Add New Category"
      >
        <form
          onSubmit={categoryForm.onSubmit(
            editingCategory ? handleUpdateCategory : handleCreateCategory
          )}
        >
          <Stack>
            <TextInput
              label="Name"
              placeholder="Category name"
              required
              {...categoryForm.getInputProps("name")}
            />
            <Textarea
              label="Description"
              placeholder="Category description"
              minRows={3}
              required
              {...categoryForm.getInputProps("description")}
            />
            <Group position="right" mt="md">
              <Button
                variant="subtle"
                onClick={() => setCategoryModalOpened(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
