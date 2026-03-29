package ims.orariaperti.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ims.orariaperti.DTO.ReservationDTO;
import ims.orariaperti.entity.Reservation;
import ims.orariaperti.entity.Room;
import ims.orariaperti.repository.ReservationRepository;
import ims.orariaperti.repository.RoomRepository;
import ims.orariaperti.utilities.RoomFeatures;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
/**
 * Unit tests for {@link ReservationController}.
 * This class tests all REST endpoints related to reservations as seen in {@link ReservationController},
 * including validation, authorization, and persistence behavior.
 */
@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ReservationRepository reservationRepository;

    @MockitoBean
    private RoomRepository roomRepository;

    /**
     * Verify that a request without any keys returns HTTP 400.
     */
    @Test
    void getReservationsReturnsBadRequestWhenNoKeysProvided() throws Exception {

        // Act & Assert
        mockMvc.perform(get("/api/reservation"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Verify GET using a valid private key.
     */
    @Test
    void getReservationsReturnsReservationByPrivateKey() throws Exception {

        // Arrange
        Reservation reservation = createReservation(UUID.randomUUID(), UUID.randomUUID());
        when(reservationRepository.findByPrivateKey(reservation.getPrivateKey()))
                .thenReturn(Optional.of(reservation));

        // Act & Assert
        mockMvc.perform(get("/api/reservation")
                        .header("privatekey", reservation.getPrivateKey().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.privateKey").value(reservation.getPrivateKey().toString()))
                .andExpect(jsonPath("$.publicKey").value(reservation.getPublicKey().toString()))
                .andExpect(jsonPath("$.reservationDetails.id").value(reservation.getId().toString()));
    }

    /**
     * Verify that an unknown public key returns HTTP 404.
     */
    @Test
    void getReservationsReturnsNotFoundWhenPublicKeyDoesNotExist() throws Exception {

        // Arrange
        UUID unknownPublicKey = UUID.randomUUID();
        when(reservationRepository.findByPublicKey(unknownPublicKey)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/reservation")
                        .header("publickey", unknownPublicKey.toString()))
                .andExpect(status().isNotFound());
    }

    /**
     * Verify that invalid participant names return HTTP 400.
     */
    @Test
    void createReservationReturnsBadRequestForInvalidParticipants() throws Exception {

        // Arrange
        ReservationDTO dto = createReservationDto(UUID.randomUUID(), "Alice, Bob1");

        // Act & Assert
        mockMvc.perform(post("/api/reservation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    /**
     * Verify that overlapping reservations are rejected.
     */
    @Test
    void createReservationReturnsBadRequestWhenTimeOverlaps() throws Exception {

        // Arrange
        Room room = createRoom();
        ReservationDTO dto = createReservationDto(room.getId(), "Alice, Bob");

        Reservation existingReservation = new Reservation(
                UUID.randomUUID(),
                dto.getDate(),
                LocalTime.of(9, 30),
                LocalTime.of(10, 30),
                room,
                "Existing",
                "Jane",
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));
        when(reservationRepository.findAll()).thenReturn(List.of(existingReservation));

        // Act & Assert
        mockMvc.perform(post("/api/reservation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    /**
     * Verify successful reservation creation.
     */
    @Test
    void createReservationPersistsAndReturnsKeysForValidInput() throws Exception {

        // Arrange
        Room room = createRoom();
        ReservationDTO dto = createReservationDto(room.getId(), "Alice, Bob");

        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));
        when(reservationRepository.findAll()).thenReturn(List.of());

        doAnswer(invocation -> {
            Reservation toSave = invocation.getArgument(0);
            toSave.generateKeys();
            return toSave;
        }).when(reservationRepository).save(any(Reservation.class));

        // Act & Assert
        mockMvc.perform(post("/api/reservation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reservation.room.id").value(room.getId().toString()))
                .andExpect(jsonPath("$.privateKey").exists())
                .andExpect(jsonPath("$.publicKey").exists());

        verify(reservationRepository).save(any(Reservation.class));
    }

    /**
     * Verify deletion fails without private key.
     */
    @Test
    void deleteReservationReturnsUnauthorizedWhenNoPrivateKey() throws Exception {

        // Act & Assert
        mockMvc.perform(delete("/api/reservation/{id}", UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Verify deletion fails with incorrect private key.
     */
    @Test
    void deleteReservationReturnsUnauthorizedWhenPrivateKeyIsWrong() throws Exception {

        // Arrange
        Reservation reservation = createReservation(UUID.randomUUID(), UUID.randomUUID());
        when(reservationRepository.getFirstById(reservation.getId())).thenReturn(reservation);

        // Act & Assert
        mockMvc.perform(delete("/api/reservation/{id}", reservation.getId())
                        .header("privateKey", UUID.randomUUID().toString()))
                .andExpect(status().isUnauthorized());

        verify(reservationRepository, never()).delete(any(Reservation.class));
    }

    /**
     * Verify successful deletion with correct private key.
     */
    @Test
    void deleteReservationDeletesReservationWhenPrivateKeyMatches() throws Exception {

        // Arrange
        Reservation reservation = createReservation(UUID.randomUUID(), UUID.randomUUID());
        when(reservationRepository.getFirstById(reservation.getId())).thenReturn(reservation);

        // Act & Assert
        mockMvc.perform(delete("/api/reservation/{id}", reservation.getId())
                        .header("privateKey", reservation.getPrivateKey().toString()))
                .andExpect(status().isOk());

        verify(reservationRepository).delete(reservation);
    }

    /**
     * Verify update fails without private key.
     */
    @Test
    void updateReservationReturnsUnauthorizedWhenNoPrivateKey() throws Exception {

        // Arrange
        ReservationDTO dto = createReservationDto(UUID.randomUUID(), "Alice");

        // Act & Assert
        mockMvc.perform(put("/api/reservation/{id}", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Verify update fails with invalid participants.
     */
    @Test
    void updateReservationReturnsBadRequestForInvalidParticipants() throws Exception {

        // Arrange
        Room room = createRoom();
        Reservation reservation = createReservation(UUID.randomUUID(), UUID.randomUUID());
        ReservationDTO dto = createReservationDto(room.getId(), "Alice, Bob1");

        when(reservationRepository.getFirstById(reservation.getId())).thenReturn(reservation);

        // Act & Assert
        mockMvc.perform(put("/api/reservation/{id}", reservation.getId())
                        .header("privateKey", reservation.getPrivateKey().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Verify successful update of a reservation.
     */
    @Test
    void updateReservationUpdatesReservationWhenInputIsValid() throws Exception {

        // Arrange
        Room room = createRoom();
        Reservation reservation = createReservation(UUID.randomUUID(), UUID.randomUUID());
        ReservationDTO dto = createReservationDto(room.getId(), "Alice, Bob");

        when(reservationRepository.getFirstById(reservation.getId())).thenReturn(reservation);
        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));
        when(reservationRepository.findAll()).thenReturn(List.of(reservation));
        when(reservationRepository.findById(reservation.getId())).thenReturn(Optional.of(reservation));

        // Act & Assert
        mockMvc.perform(put("/api/reservation/{id}", reservation.getId())
                        .header("privateKey", reservation.getPrivateKey().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value(dto.getDescription()))
                .andExpect(jsonPath("$.participants").value(dto.getParticipants()));

        verify(reservationRepository).save(reservation);
    }

    /**
     * Helper method to create a ReservationDTO.
     */
    private ReservationDTO createReservationDto(UUID roomId, String participants) {
        return new ReservationDTO(
                LocalDate.of(2026, 4, 5),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                roomId,
                "Sprint planning",
                participants
        );
    }

    /**
     * Helper method to create a Reservation entity.
     */
    private Reservation createReservation(UUID id, UUID privateKey) {
        Room room = createRoom();
        return new Reservation(
                id,
                LocalDate.of(2026, 4, 5),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                room,
                "Planning",
                "Alice, Bob",
                privateKey,
                UUID.randomUUID()
        );
    }

    /**
     * Helper method to create a Room entity.
     */
    private Room createRoom() {
        return new Room(
                UUID.randomUUID(),
                "101",
                new ArrayList<>(List.of(RoomFeatures.WIFI, RoomFeatures.WHITEBOARD))
        );
    }
}