package ims.orariaperti.utilities;

import ims.orariaperti.entity.Reservation;
import ims.orariaperti.entity.Room;
import ims.orariaperti.repository.ReservationRepository;
import ims.orariaperti.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.UUID;

@Component
public class Seeder implements CommandLineRunner {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    @Autowired
    public Seeder(ReservationRepository reservationRepository,  RoomRepository roomRepository) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public void run(String... args) {
        if (roomRepository.count() == 0) {
            Room room101 = roomRepository.save(new Room(null, "101", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.WHITEBOARD))));
            Room room102 = roomRepository.save(new Room(null, "102", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.WHITEBOARD))));
            @SuppressWarnings("unused")
            Room room201 = roomRepository.save(new Room(null, "201", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.WATER_SOURCE))));
            @SuppressWarnings("unused")
            Room room103 = roomRepository.save(new Room(null, "103", new ArrayList<>(Arrays.asList(RoomFeatures.WHITEBOARD, RoomFeatures.WIFI))));
            @SuppressWarnings("unused")
            Room room104 = roomRepository.save(new Room(null, "104", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.AIR_CONDITIONING))));
            @SuppressWarnings("unused")
            Room room105 = roomRepository.save(new Room(null, "105", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.POWER_OUTLETS))));
            @SuppressWarnings("unused")
            Room room110 = roomRepository.save(new Room(null, "110", new ArrayList<>(Arrays.asList(RoomFeatures.WHITEBOARD, RoomFeatures.NATURAL_LIGHT))));
            @SuppressWarnings("unused")
            Room room120 = roomRepository.save(new Room(null, "120", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.SOUNDPROOFING))));
            @SuppressWarnings("unused")
            Room room130 = roomRepository.save(new Room(null, "130", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.SMART_BOARD, RoomFeatures.WIFI))));
            @SuppressWarnings("unused")
            Room room140 = roomRepository.save(new Room(null, "140", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.WHITEBOARD, RoomFeatures.POWER_OUTLETS))));
            @SuppressWarnings("unused")
            Room room150 = roomRepository.save(new Room(null, "150", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.LOCKERS))));
            @SuppressWarnings("unused")
            Room room201_2 = roomRepository.save(new Room(null, "201", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.WATER_SOURCE))));
            @SuppressWarnings("unused")
            Room room202 = roomRepository.save(new Room(null, "202", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.WHITEBOARD, RoomFeatures.AIR_CONDITIONING))));
            @SuppressWarnings("unused")
            Room room210 = roomRepository.save(new Room(null, "210", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.PROJECTOR_SCREEN))));
            @SuppressWarnings("unused")
            Room room220 = roomRepository.save(new Room(null, "220", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.SPEAKER_SYSTEM))));
            @SuppressWarnings("unused")
            Room room230 = roomRepository.save(new Room(null, "230", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.VIDEO_CONFERENCING, RoomFeatures.WIFI))));
            @SuppressWarnings("unused")
            Room room240 = roomRepository.save(new Room(null, "240", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.POWER_OUTLETS, RoomFeatures.NATURAL_LIGHT))));
            @SuppressWarnings("unused")
            Room room250 = roomRepository.save(new Room(null, "250", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.SMART_BOARD))));
            @SuppressWarnings("unused")
            Room room301 = roomRepository.save(new Room(null, "301", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.WHITEBOARD, RoomFeatures.TELEPHONE))));
            @SuppressWarnings("unused")
            Room room310 = roomRepository.save(new Room(null, "310", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.COFFEE_MACHINE))));
            @SuppressWarnings("unused")
            Room room320 = roomRepository.save(new Room(null, "320", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.PRINTER))));
            @SuppressWarnings("unused")
            Room room330 = roomRepository.save(new Room(null, "330", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.LOCKERS, RoomFeatures.WIFI))));
            @SuppressWarnings("unused")
            Room room340 = roomRepository.save(new Room(null, "340", new ArrayList<>(Arrays.asList(RoomFeatures.BEAMER, RoomFeatures.WHITEBOARD, RoomFeatures.AIR_CONDITIONING, RoomFeatures.POWER_OUTLETS))));
            System.out.println("Sample Rooms have been added to the database.");

            if (reservationRepository.count() == 0) {
                reservationRepository.save(new Reservation(
                        null,
                        LocalDate.now(),
                        LocalTime.of(9, 0),
                        LocalTime.of(10, 0),
                        room101,
                        "Team Meeting",
                        "Tom, Johnson",
                        UUID.randomUUID(),
                        UUID.randomUUID()
                ));
                reservationRepository.save(new Reservation(
                        null,
                        LocalDate.now(),
                        LocalTime.of(11, 0),
                        LocalTime.of(12, 0),
                        room102,
                        "Project Discussion",
                        "Mac, Fluury",
                        UUID.randomUUID(),
                        UUID.randomUUID()
                ));
                reservationRepository.save(new Reservation(
                        null,
                        LocalDate.now(),
                        LocalTime.of(11, 0),
                        LocalTime.of(12, 0),
                        room102,
                        "Project Feedback",
                        "Pluh, Tompson",
                        UUID.randomUUID(),
                        UUID.randomUUID()
                ));
                System.out.println("Sample Reservations have been added to the database. If you are running this project with Docker and no container failed, you can visit the website now on http://localhost:[FRONTEND_PORT YOU'VE SET IN THE .ENV]");
            }
        }
    }
}
