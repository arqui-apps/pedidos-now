
DROP DATABASE IF EXISTS chat_service_db;

CREATE DATABASE chat_service_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE chat_service_db;

CREATE TABLE chat_availability (
  id                  CHAR(36)         NOT NULL DEFAULT (UUID()),
  day_of_week         TINYINT UNSIGNED NOT NULL,   -- 0 = Sunday … 6 = Saturday
  start_time          TIME             NOT NULL,
  end_time            TIME             NOT NULL,
  enabled             TINYINT(1)       NOT NULL DEFAULT 1,
  timezone            VARCHAR(64)      NOT NULL DEFAULT 'America/Guatemala',

  deleted_at          DATETIME(3)      NULL DEFAULT NULL,

  created_at          DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                       ON UPDATE CURRENT_TIMESTAMP(3),

  active_day_of_week  TINYINT UNSIGNED
                      GENERATED ALWAYS AS (
                        CASE
                          WHEN deleted_at IS NULL THEN day_of_week
                          ELSE NULL
                        END
                      ) STORED,

  PRIMARY KEY (id),
  UNIQUE KEY uk_active_day_of_week (active_day_of_week),
  KEY idx_enabled (enabled),
  KEY idx_deleted (deleted_at),

  CHECK (day_of_week BETWEEN 0 AND 6),
  CHECK (start_time < end_time)
) ENGINE=InnoDB;

CREATE TABLE conversations (
  id                        CHAR(36)     NOT NULL DEFAULT (UUID()),

  requester_type            ENUM('CUSTOMER','COURIER','BUSINESS') NOT NULL,
  requester_ext_id          VARCHAR(64)  NOT NULL,
  assigned_agent_ext_id     VARCHAR(64)  NULL,

  case_type                 ENUM('ORDER','DELIVERY','BUSINESS_CASE','OTHER')
                                         NOT NULL DEFAULT 'OTHER',
  case_reference            VARCHAR(64)  NULL,

  status                    ENUM(
                              'OPEN',
                              'IN_QUEUE',
                              'RESOLVED_NO_SOLUTION',
                              'RESOLVED_COUPON',
                              'RESOLVED_REFUND',
                              'CLOSED_TIMEOUT',
                              'CLOSED_MANUAL',
                              'CLOSED_OUT_OF_HOURS'
                            )            NOT NULL DEFAULT 'IN_QUEUE',

  subject                   VARCHAR(255) NULL,

  opened_at                 DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_activity_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_user_message_at      DATETIME(3)  NULL,
  last_agent_message_at     DATETIME(3)  NULL,

  closed_at                 DATETIME(3)  NULL,
  close_reason              ENUM('TIMEOUT','MANUAL','OUT_OF_HOURS','SYSTEM') NULL,

  inactivity_minutes        SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  inactivity_deadline_at    DATETIME(3)  NULL,

  is_live                   TINYINT(1)   NOT NULL DEFAULT 1,
  out_of_hours              TINYINT(1)   NOT NULL DEFAULT 0,

  deleted_at                DATETIME(3)  NULL DEFAULT NULL,

  created_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                         ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),

  KEY idx_status            (status),
  KEY idx_requester         (requester_ext_id, requester_type),
  KEY idx_agent             (assigned_agent_ext_id),
  KEY idx_case              (case_type, case_reference),
  KEY idx_last_activity     (last_activity_at),
  KEY idx_deleted           (deleted_at)
) ENGINE=InnoDB;

CREATE TABLE participants (
  conversation_id    CHAR(36)     NOT NULL,
  participant_ext_id VARCHAR(64)  NOT NULL,

  role               ENUM('USER','AGENT') NOT NULL,
  display_name       VARCHAR(120) NULL,
  joined_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  left_at            DATETIME(3)  NULL,

  deleted_at         DATETIME(3)  NULL DEFAULT NULL,

  created_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                  ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (conversation_id, participant_ext_id),
  KEY idx_role       (role),
  KEY idx_deleted    (deleted_at),

  CONSTRAINT fk_participants_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE messages (
  id                 CHAR(36)    NOT NULL DEFAULT (UUID()),
  conversation_id    CHAR(36)    NOT NULL,

  sender_role        ENUM('USER','AGENT','SYSTEM') NOT NULL,
  sender_ext_id      VARCHAR(64) NULL,

  message_type       ENUM(
                       'TEXT',
                       'AUTO_OPEN',
                       'AUTO_CLOSE',
                       'AUTO_OUT_OF_HOURS',
                       'SYSTEM_NOTE'
                     )           NOT NULL DEFAULT 'TEXT',
  content            TEXT        NOT NULL,

  client_message_id  VARCHAR(64) NULL,

  sent_at            DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  deleted_at         DATETIME(3) NULL DEFAULT NULL,

  created_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                 ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_conversation_time (conversation_id, sent_at),
  KEY idx_deleted           (deleted_at),
  UNIQUE KEY uk_conversation_client_msg (conversation_id, client_message_id),

  CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE attachments (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  message_id        CHAR(36)     NOT NULL,

  file_name         VARCHAR(255) NULL,
  url               TEXT         NOT NULL,
  mime_type         VARCHAR(120) NULL,
  size_bytes        BIGINT UNSIGNED NULL,

  deleted_at        DATETIME(3)  NULL DEFAULT NULL,

  created_at        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                 ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_message   (message_id),
  KEY idx_deleted   (deleted_at),

  CONSTRAINT fk_attachments_message
    FOREIGN KEY (message_id) REFERENCES messages(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE status_history (
  id                 CHAR(36)    NOT NULL DEFAULT (UUID()),
  conversation_id    CHAR(36)    NOT NULL,

  previous_status    VARCHAR(40) NULL,
  new_status         VARCHAR(40) NOT NULL,

  changed_by_role    ENUM('USER','AGENT','SYSTEM') NOT NULL DEFAULT 'SYSTEM',
  changed_by_ext_id  VARCHAR(64) NULL,

  reason             VARCHAR(255) NULL,
  changed_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  deleted_at         DATETIME(3) NULL DEFAULT NULL,

  created_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                 ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_conversation_change (conversation_id, changed_at),
  KEY idx_new_status          (new_status),
  KEY idx_deleted             (deleted_at),

  CONSTRAINT fk_status_history_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE metrics (
  conversation_id               CHAR(36)        NOT NULL,

  total_messages                INT UNSIGNED    NOT NULL DEFAULT 0,
  total_user_messages           INT UNSIGNED    NOT NULL DEFAULT 0,
  total_agent_messages          INT UNSIGNED    NOT NULL DEFAULT 0,

  first_agent_response_ms       BIGINT UNSIGNED NULL,
  total_agent_response_ms       BIGINT UNSIGNED NOT NULL DEFAULT 0,
  agent_response_count          INT UNSIGNED    NOT NULL DEFAULT 0,

  resolved_at                   DATETIME(3)     NULL,
  time_to_close_ms              BIGINT UNSIGNED NULL,

  deleted_at                    DATETIME(3)     NULL DEFAULT NULL,

  created_at                    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                                ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (conversation_id),
  KEY idx_deleted               (deleted_at),

  CONSTRAINT fk_metrics_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE events (
  id                 CHAR(36)    NOT NULL DEFAULT (UUID()),
  conversation_id    CHAR(36)    NOT NULL,

  event_type         VARCHAR(60) NOT NULL,
  payload            JSON        NULL,

  deleted_at         DATETIME(3) NULL DEFAULT NULL,

  created_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                 ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_conversation_event_time (conversation_id, created_at),
  KEY idx_event_type              (event_type),
  KEY idx_deleted                 (deleted_at),

  CONSTRAINT fk_events_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

DELIMITER $$

CREATE TRIGGER trg_messages_after_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
  UPDATE conversations
     SET last_activity_at       = NEW.sent_at,
         inactivity_deadline_at = DATE_ADD(NEW.sent_at, INTERVAL inactivity_minutes MINUTE),
         last_user_message_at   = IF(NEW.sender_role = 'USER',  NEW.sent_at, last_user_message_at),
         last_agent_message_at  = IF(NEW.sender_role = 'AGENT', NEW.sent_at, last_agent_message_at)
   WHERE id = NEW.conversation_id;

  INSERT INTO metrics (conversation_id, deleted_at)
  VALUES (NEW.conversation_id, NULL)
  ON DUPLICATE KEY UPDATE
    deleted_at = NULL,
    updated_at = CURRENT_TIMESTAMP(3);

  UPDATE metrics
     SET total_messages       = total_messages + 1,
         total_user_messages  = total_user_messages  + IF(NEW.sender_role = 'USER',  1, 0),
         total_agent_messages = total_agent_messages + IF(NEW.sender_role = 'AGENT', 1, 0),
         updated_at           = CURRENT_TIMESTAMP(3)
   WHERE conversation_id = NEW.conversation_id
     AND deleted_at IS NULL;
END$$

DELIMITER ;