import { useState, useEffect, useRef } from "react";
import {
  Card,
  Text,
  Button,
  TextInput,
  Textarea,
  Stack,
  Group,
  Title,
  Paper,
  Divider,
  Alert,
  Image,
  FileInput,
  SimpleGrid,
  ActionIcon,
  Badge,
  Modal,
  Center,
  rem,
  UnstyledButton,
  Pagination,
  NumberInput,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { advertisementsService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconArrowLeft,
  IconArrowRight,
  IconPhoneCall,
  IconPhone,
} from "@tabler/icons-react";

export default function Advertisements() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalAdId, setModalAdId] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const [activeSlides, setActiveSlides] = useState({});
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();

  const form = useForm({
    initialValues: {
      title: "",
      content: "",
      price: 0,
      phone_number: "",
    },
    validate: {
      title: (value) => (value ? null : "Title is required"),
      content: (value) => (value ? null : "Content is required"),
      price: (value) => (!isNaN(value) ? null : "Price must be a number"),
      phone_number: (value) =>
        value
          ? //begins with 01 and is 11 numbers long
            value.match(/^01[0-9]{9}$/)
            ? null
            : "Phone number must be 11 digits and begin with 01"
          : "Phone number is required",
    },
  });

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await advertisementsService.getAdvertisements();
      setAdvertisements(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch advertisements:", err);
      setError("Failed to load advertisements. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setUploading(true);

      if (selectedFiles.length > 0) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("price", values.price);
        formData.append("phone_number", values.phone_number);
        // Append all selected files
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });

        // Use the multipart/form-data approach
        await advertisementsService.createAdvertisementWithImages(formData);
      } else {
        // Use the regular JSON approach if no files
        await advertisementsService.createAdvertisement(values);
      }

      form.reset();
      setSelectedFiles([]);
      fetchAdvertisements();
    } catch (err) {
      console.error("Failed to create advertisement:", err);
      setError("Failed to create advertisement. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAd = async (adId) => {
    try {
      await advertisementsService.deleteAdvertisement(adId);
      fetchAdvertisements();
    } catch (err) {
      console.error("Failed to delete advertisement:", err);
      setError("Failed to delete advertisement. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleFileChange = (files) => {
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openImageModal = (adId, imageIndex) => {
    const ad = advertisements.find((ad) => ad.id === adId);
    if (ad && ad.images && ad.images.length > 0) {
      setModalAdId(adId);
      setModalImageIndex(imageIndex);
      setModalImage(ad.images[imageIndex]);
      open();
    }
  };

  const handlePrevModalImage = () => {
    if (!modalAdId) return;

    const ad = advertisements.find((ad) => ad.id === modalAdId);
    if (!ad || !ad.images || ad.images.length <= 1) return;

    const newIndex =
      modalImageIndex > 0 ? modalImageIndex - 1 : ad.images.length - 1;
    setModalImageIndex(newIndex);
    setModalImage(ad.images[newIndex]);
  };

  const handleNextModalImage = () => {
    if (!modalAdId) return;

    const ad = advertisements.find((ad) => ad.id === modalAdId);
    if (!ad || !ad.images || ad.images.length <= 1) return;

    const newIndex =
      modalImageIndex < ad.images.length - 1 ? modalImageIndex + 1 : 0;
    setModalImageIndex(newIndex);
    setModalImage(ad.images[newIndex]);
  };

  const handlePrevImage = (adId) => {
    setActiveSlides((prev) => {
      const currentIndex = prev[adId] || 0;
      const adImages =
        advertisements.find((ad) => ad.id === adId)?.images || [];
      return {
        ...prev,
        [adId]: currentIndex > 0 ? currentIndex - 1 : adImages.length - 1,
      };
    });
  };

  const handleNextImage = (adId) => {
    setActiveSlides((prev) => {
      const currentIndex = prev[adId] || 0;
      const adImages =
        advertisements.find((ad) => ad.id === adId)?.images || [];
      return {
        ...prev,
        [adId]: currentIndex < adImages.length - 1 ? currentIndex + 1 : 0,
      };
    });
  };

  const setActiveSlide = (adId, index) => {
    setActiveSlides((prev) => ({
      ...prev,
      [adId]: index,
    }));
  };

  return (
    <>
      <Stack spacing="lg">
        <Title order={2}>Neighborhood Advertisements</Title>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <Paper shadow="xs" p="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Title"
                placeholder="Advertisement title"
                {...form.getInputProps("title")}
              />
              <Textarea
                label="Content"
                placeholder="Describe what you're offering or looking for..."
                minRows={3}
                {...form.getInputProps("content")}
              />

              <NumberInput
                label="Price"
                placeholder="Enter the price"
                hideControls
                {...form.getInputProps("price")}
              />

              <TextInput
                label="Phone Number"
                placeholder="Enter your phone number"
                maxLength={11}
                {...form.getInputProps("phone_number")}
              />

              <FileInput
                label="Images (optional)"
                placeholder="Upload images"
                accept="image/*"
                multiple
                value={selectedFiles}
                onChange={handleFileChange}
                icon={<IconUpload size={14} />}
                ref={fileInputRef}
              />

              {selectedFiles.length > 0 && (
                <SimpleGrid
                  cols={4}
                  breakpoints={[{ maxWidth: "sm", cols: 2 }]}
                  mt="xs"
                >
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <Badge
                        style={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          zIndex: 2,
                        }}
                        radius="xl"
                        size="sm"
                        variant="filled"
                        color="red"
                        onClick={() => removeFile(index)}
                        sx={{ cursor: "pointer" }}
                      >
                        <IconX size={10} />
                      </Badge>
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        height={80}
                        fit="cover"
                        radius="md"
                      />
                    </div>
                  ))}
                </SimpleGrid>
              )}

              <Button type="submit" loading={uploading}>
                Post Advertisement
              </Button>
            </Stack>
          </form>
        </Paper>

        <Divider my="sm" label="Advertisements" labelPosition="center" />

        {loading ? (
          <Text>Loading advertisements...</Text>
        ) : advertisements.length === 0 ? (
          <Text ta="center">
            No advertisements yet. Be the first to post one!
          </Text>
        ) : (
          <Stack spacing="md">
            {advertisements.map((ad) => (
              <Card key={ad.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Stack>
                  <Group position="apart">
                    <Title order={4}>{ad.title}</Title>
                    <Text size="sm" c="dimmed">
                      {formatDate(ad.created_at)}
                    </Text>
                    <Box pos="absolute" right={"1rem"} top={"1rem"} style={{textAlign:"end"}}>

                    <Text>
                      {ad.price} EGP
                    </Text>
                    <Text component="a" style={{cursor:"pointer", color:"blue"}} href={`tel:${ad.phone_number}`}>
                      <IconPhone height={"1rem"}/>{ad.phone_number}
                    </Text>
                    </Box>
                  </Group>

                  <Text>{ad.content}</Text>

                  {/* Custom image slider */}
                  {ad.images && ad.images.length > 0 && (
                    <div
                      style={{
                        position: "relative",
                        marginTop: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "8px",
                        }}
                      >
                        <Image
                          src={ad.images[activeSlides[ad.id] || 0]}
                          alt={`Advertisement image ${
                            (activeSlides[ad.id] || 0) + 1
                          }`}
                          height={250}
                          fit="contain"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            openImageModal(ad.id, activeSlides[ad.id] || 0)
                          }

                        />

                        {/* Navigation arrows */}
                        {ad.images.length > 1 && (
                          <>
                            <ActionIcon
                              variant="filled"
                              color="gray"
                              radius="xl"
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: 10,
                                transform: "translateY(-50%)",
                                opacity: 0.7,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevImage(ad.id);
                              }}
                            >
                              <IconArrowLeft size={16} />
                            </ActionIcon>

                            <ActionIcon
                              variant="filled"
                              color="gray"
                              radius="xl"
                              style={{
                                position: "absolute",
                                top: "50%",
                                right: 10,
                                transform: "translateY(-50%)",
                                opacity: 0.7,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage(ad.id);
                              }}
                            >
                              <IconArrowRight size={16} />
                            </ActionIcon>
                          </>
                        )}
                      </div>

                      {/* Image indicators */}
                      {ad.images.length > 1 && (
                        <Group position="center" spacing="xs" mt="xs">
                          {ad.images.map((_, index) => (
                            <div
                              key={index}
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor:
                                  index === (activeSlides[ad.id] || 0)
                                    ? "#228be6"
                                    : "#e9ecef",
                                cursor: "pointer",
                              }}
                              onClick={() => setActiveSlide(ad.id, index)}
                            />
                          ))}
                        </Group>
                      )}
                    </div>
                  )}

                  <Group position="apart">
                    <Text size="sm" fw={500}>
                      Posted by: {ad.author.username}
                    </Text>

                    {(currentUser.is_admin ||
                      currentUser.id === ad.author.id) && (
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Modal for full-sized image view */}
      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        padding="xs"
        withCloseButton={false}
        centered
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        {modalImage && (
          <div style={{ position: "relative" }}>
            <ActionIcon
              variant="filled"
              color="gray"
              radius="xl"
              style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
              onClick={close}
            >
              <IconX size={18} />
            </ActionIcon>

            {/* Modal navigation controls */}
            {modalAdId &&
              advertisements.find((ad) => ad.id === modalAdId)?.images?.length >
                1 && (
                <>
                  <ActionIcon
                    variant="filled"
                    color="gray"
                    radius="xl"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 20,
                      transform: "translateY(-50%)",
                      zIndex: 10,
                    }}
                    onClick={handlePrevModalImage}
                    size="lg"
                  >
                    <IconArrowLeft size={20} />
                  </ActionIcon>

                  <ActionIcon
                    variant="filled"
                    color="gray"
                    radius="xl"
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: 20,
                      transform: "translateY(-50%)",
                      zIndex: 10,
                    }}
                    onClick={handleNextModalImage}
                    size="lg"
                  >
                    <IconArrowRight size={20} />
                  </ActionIcon>

                  {/* Image counter */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 15,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "15px",
                      fontSize: "14px",
                      zIndex: 10,
                    }}
                  >
                    {modalImageIndex + 1} /{" "}
                    {
                      advertisements.find((ad) => ad.id === modalAdId)?.images
                        ?.length
                    }
                  </div>
                </>
              )}

            <Center>
              <Image
                src={modalImage}
                alt="Full size image"
                fit="contain"
                height={`calc(90vh - ${rem(100)})`}
                width="100%"
              />
            </Center>
          </div>
        )}
      </Modal>
    </>
  );
}
