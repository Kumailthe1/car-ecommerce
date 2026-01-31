-- Clear existing data if necessary
TRUNCATE TABLE vehicle_images;
DELETE FROM vehicles;

-- 1. Porsche 911 GT3 RS
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Porsche', '911 GT3 RS', 2024, 241300, 'WP0ZZZ99ZNS270001', 120, '4.0L Flat-6', 'PDK Automatic', 'Shark Blue', 'available', 'cars/car-1/1.webp');
SET @v1 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v1, 'cars/car-1/10.webp'), (@v1, 'cars/car-1/11.webp'), (@v1, 'cars/car-1/12.webp'), (@v1, 'cars/car-1/13.webp'), 
(@v1, 'cars/car-1/14.webp'), (@v1, 'cars/car-1/15.webp'), (@v1, 'cars/car-1/2.webp'), (@v1, 'cars/car-1/3.webp'), 
(@v1, 'cars/car-1/4.webp'), (@v1, 'cars/car-1/5.webp'), (@v1, 'cars/car-1/6.webp'), (@v1, 'cars/car-1/7.webp'), 
(@v1, 'cars/car-1/8.webp'), (@v1, 'cars/car-1/9.webp');

-- 2. Mercedes-Benz G 63 AMG
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Mercedes-Benz', 'G 63 AMG', 2023, 179000, 'WDCYC7JF0PX400002', 2500, '4.0L V8 Biturbo', '9G-TRONIC', 'Obsidian Black', 'available', 'cars/car-2/1.webp');
SET @v2 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v2, 'cars/car-2/10.webp'), (@v2, 'cars/car-2/11.webp'), (@v2, 'cars/car-2/12.webp'), (@v2, 'cars/car-2/13.webp'), 
(@v2, 'cars/car-2/14.webp'), (@v2, 'cars/car-2/15.webp'), (@v2, 'cars/car-2/16.webp'), (@v2, 'cars/car-2/2.webp'), 
(@v2, 'cars/car-2/3.webp'), (@v2, 'cars/car-2/5.webp'), (@v2, 'cars/car-2/6.webp'), (@v2, 'cars/car-2/7.webp'), 
(@v2, 'cars/car-2/8.webp'), (@v2, 'cars/car-2/9.webp');

-- 3. Tesla Model S Plaid
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Tesla', 'Model S Plaid', 2024, 89990, '5YJSA1E41RF000003', 450, 'Tri-Motor Electric', 'Single Speed', 'Pearl White', 'available', 'cars/car-3/1.webp');
SET @v3 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v3, 'cars/car-3/10.webp'), (@v3, 'cars/car-3/11.webp'), (@v3, 'cars/car-3/12.webp'), (@v3, 'cars/car-3/13.webp'), 
(@v3, 'cars/car-3/14.webp'), (@v3, 'cars/car-3/15.webp'), (@v3, 'cars/car-3/16.webp'), (@v3, 'cars/car-3/2.webp'), 
(@v3, 'cars/car-3/3.webp'), (@v3, 'cars/car-3/4.webp'), (@v3, 'cars/car-3/5.webp'), (@v3, 'cars/car-3/6.webp'), 
(@v3, 'cars/car-3/7.webp'), (@v3, 'cars/car-3/8.webp'), (@v3, 'cars/car-3/9.webp');

-- 4. Lamborghini Urus
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Lamborghini', 'Urus', 2022, 225500, 'ZHWGU1ZT1NLA00004', 8500, '4.0L V8 Twin-Turbo', '8-Speed Automatic', 'Giallo Auge', 'available', 'cars/car-4/1.webp');
SET @v4 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v4, 'cars/car-4/2.webp'), (@v4, 'cars/car-4/3.webp'), (@v4, 'cars/car-4/4.webp'), (@v4, 'cars/car-4/5.webp'), 
(@v4, 'cars/car-4/6.webp'), (@v4, 'cars/car-4/7.webp');

-- 5. Rolls-Royce Ghost
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Rolls-Royce', 'Ghost', 2023, 348500, 'SCA66LSA0PX000005', 1200, '6.75L V12', '8-Speed Automatic', 'Arctic White', 'available', 'cars/car-5/1.webp');
SET @v5 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v5, 'cars/car-5/10.webp'), (@v5, 'cars/car-5/11.webp'), (@v5, 'cars/car-5/12.webp'), (@v5, 'cars/car-5/13.webp'), 
(@v5, 'cars/car-5/14.webp'), (@v5, 'cars/car-5/15.webp'), (@v5, 'cars/car-5/16.webp'), (@v5, 'cars/car-5/17.webp'), 
(@v5, 'cars/car-5/18.webp'), (@v5, 'cars/car-5/19.webp'), (@v5, 'cars/car-5/2.webp'), (@v5, 'cars/car-5/3.webp'), 
(@v5, 'cars/car-5/4.webp'), (@v5, 'cars/car-5/5.webp'), (@v5, 'cars/car-5/6.webp'), (@v5, 'cars/car-5/7.webp'), 
(@v5, 'cars/car-5/8.webp'), (@v5, 'cars/car-5/9.webp');

-- 6. Chrysler 300S
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Chrysler', '300S', 2022, 42000, '2C3CCAAG6NH000006', 15000, '5.7L HEMI V8', '8-Speed Automatic', 'Bright White', 'available', 'cars/car-6/1.webp');
SET @v6 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v6, 'cars/car-6/2.webp'), (@v6, 'cars/car-6/3.webp'), (@v6, 'cars/car-6/4.webp'), (@v6, 'cars/car-6/5.webp'), 
(@v6, 'cars/car-6/6.webp');

-- 7. BMW M4 Competition
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('BMW', 'M4 Competition', 2024, 82200, 'WBS53AZ01RF000007', 800, '3.0L Straight-6', 'M Steptronic', 'Isle of Man Green', 'available', 'cars/car-7/1.webp');
SET @v7 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v7, 'cars/car-7/10.webp'), (@v7, 'cars/car-7/11.webp'), (@v7, 'cars/car-7/12.webp'), (@v7, 'cars/car-7/13.webp'), 
(@v7, 'cars/car-7/14.webp'), (@v7, 'cars/car-7/15.webp'), (@v7, 'cars/car-7/16.webp'), (@v7, 'cars/car-7/2.webp'), 
(@v7, 'cars/car-7/3.webp'), (@v7, 'cars/car-7/4.webp'), (@v7, 'cars/car-7/5.webp'), (@v7, 'cars/car-7/6.webp'), 
(@v7, 'cars/car-7/7.webp'), (@v7, 'cars/car-7/8.webp'), (@v7, 'cars/car-7/9.webp');

-- 8. Audi RS7
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Audi', 'RS7 Sportback', 2023, 127800, 'WAUZZZ4K1PN000008', 3500, '4.0L V8 TFSI', '8-Speed Tiptronic', 'Nardo Gray', 'available', 'cars/car-8/1.webp');
SET @v8 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v8, 'cars/car-8/10.webp'), (@v8, 'cars/car-8/2.webp'), (@v8, 'cars/car-8/3.webp'), (@v8, 'cars/car-8/4.webp'), 
(@v8, 'cars/car-8/5.webp'), (@v8, 'cars/car-8/6.webp'), (@v8, 'cars/car-8/7.webp'), (@v8, 'cars/car-8/8.webp'), 
(@v8, 'cars/car-8/9.webp');

-- 9. Jeep Trackhawk
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Jeep', 'Grand Cherokee Trackhawk', 2018, 79000, '1C4RJFK94JC000009', 68000, '6.2L Supercharged V8', '8-Speed Automatic', 'Sting-Gray', 'available', 'cars/car-9/1.webp');
SET @v9 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v9, 'cars/car-9/2.webp'), (@v9, 'cars/car-9/3.webp'), (@v9, 'cars/car-9/4.webp'), (@v9, 'cars/car-9/5.webp'), 
(@v9, 'cars/car-9/6.webp'), (@v9, 'cars/car-9/7.webp');

-- 10. Range Rover Autobiography
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Land Rover', 'Range Rover Autobiography', 2024, 166400, 'SALGV2EF3RA000010', 500, '4.4L V8 Twin-Turbo', '8-Speed Automatic', 'Santorini Black', 'available', 'cars/car-10/1.webp');
SET @v10 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v10, 'cars/car-10/2.webp'), (@v10, 'cars/car-10/3.webp'), (@v10, 'cars/car-10/4.webp');

-- 11. Chevrolet Corvette Z06
INSERT INTO vehicles (make, model, year, price, vin, mileage, engine, transmission, color, status, image) 
VALUES ('Chevrolet', 'Corvette Z06', 2023, 112700, '1G1YF2D41P5000011', 1500, '5.5L V8', '8-Speed Dual-Clutch', 'Torch Red', 'available', 'cars/car-11/1.webp');
SET @v11 = LAST_INSERT_ID();
INSERT INTO vehicle_images (vehicle_id, image_path) VALUES 
(@v11, 'cars/car-11/2.webp'), (@v11, 'cars/car-11/3.webp'), (@v11, 'cars/car-11/4.webp');
