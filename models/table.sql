-- 사용자 테이블 생성
CREATE TABLE ebdb.users (
  company_number VARCHAR(10) NOT NULL,
  salt VARCHAR(20) NOT NULL,
  password VARCHAR(20) NOT NULL,
  name VARCHAR(5) NOT NULL,
  business_name VARCHAR(30) NOT NULL,
  contact VARCHAR(11) NOT NULL,
  address VARCHAR(100) NOT NULL,
  sector_id INT NOT NULL,
  img VARCHAR(100) NOT NULL,
  PRIMARY KEY (company_number)
);

-- 도매업자 테이블 생성
CREATE TABLE ebdb.wholesalers (
  user_company_number VARCHAR(10) NOT NULL,
  homepage VARCHAR(100) NULL,
  introduce VARCHAR(200) NULL,
  PRIMARY KEY (user_company_number),
  CONSTRAINT fk_wholesalers_users_company_number
    FOREIGN KEY (user_company_number)
    REFERENCES ebdb.users (company_number)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- 업종 테이블 생성
CREATE TABLE ebdb.sectors (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(10) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX name_UNIQUE (name ASC) VISIBLE
);

-- 사용자 테이블 인덱스 추가
ALTER TABLE ebdb.users 
ADD INDEX fk_users_sectors_id_idx (sector_id ASC) VISIBLE;

-- 사용자 테이블 외래키 추가
ALTER TABLE ebdb.users 
ADD CONSTRAINT fk_users_sectors_id
  FOREIGN KEY (sector_id)
  REFERENCES ebdb.sectors (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;