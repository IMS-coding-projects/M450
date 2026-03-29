package ims.orariaperti.controller;

import ims.orariaperti.entity.Room;
import ims.orariaperti.repository.RoomRepository;
import ims.orariaperti.utilities.RoomFeatures;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for {@link RoomController}.
 * This class verifies the behavior of the RoomController REST endpoints
 * using a mocked {@link RoomRepository}.
 *
 * @implNote We only have to test the endpoints when there are rooms and if not. No room creation tests are required, since the actual app does not support that.
 */
@WebMvcTest(RoomController.class)
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RoomRepository roomRepository;

    /**
     * Verifies that when no rooms exist in the repository,
     * the API returns HTTP 404 (Not Found).
     */
    @Test
    void getRoomsReturnsNotFoundWhenNoRoomsExist() throws Exception {

        // Arrange: mock repository to return empty list
        when(roomRepository.findAll()).thenReturn(List.of());

        // Act & Assert: perform GET request and expect 404
        mockMvc.perform(get("/api/room"))
                .andExpect(status().isNotFound());
    }

    /**
     * Verifies that when rooms exist, they are correctly mapped
     * and returned in the API response.
     */
    @Test
    void getRoomsReturnsMappedRoomsWhenDataExists() throws Exception {

        // Arrange: create a room and mock repository response
        Room room = new Room(
                UUID.randomUUID(),
                "101",
                new ArrayList<>(List.of(RoomFeatures.BEAMER, RoomFeatures.WIFI))
        );
        when(roomRepository.findAll()).thenReturn(List.of(room));

        // Act & Assert: perform GET request and validate response JSON
        mockMvc.perform(get("/api/room"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(room.getId().toString()))
                .andExpect(jsonPath("$[0].roomNumber").value("101"))
                .andExpect(jsonPath("$[0].roomFeatures[0]").value("Beamer"))
                .andExpect(jsonPath("$[0].roomFeatures[1]").value("WiFi"));
    }
}