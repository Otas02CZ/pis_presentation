CREATE TABLE `pis_db`.`study_results`
(
    `id` INT NOT NULL AUTO_INCREMENT ,
    `name` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_czech_ci NULL DEFAULT NULL ,
    `date` DATE NULL DEFAULT NULL ,
    `grade` TINYINT NULL DEFAULT NULL ,
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB;

CREATE DATABASE `pis_db` COLLATE utf8mb4_czech_ci;