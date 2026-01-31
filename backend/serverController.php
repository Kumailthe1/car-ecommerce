<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Classes
require('autoloader.inc.php');
$contr = new Controller();
$view = new View();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

        if (strpos($contentType, 'application/json') !== false) {
            $input = json_decode(file_get_contents('php://input'), true);
        } else {
            $input = $_POST;
        }

        // Database Migration Check
        try {
            $pdo = new PDO('mysql:host=localhost;dbname=tlyrplis_tesla', 'tlyrplis_tesla', 'tlyrplis_tesla');
            $pdo->exec("CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                month_number INT DEFAULT 0,
                receipt_path VARCHAR(255) DEFAULT NULL,
                status ENUM('Pending Verification', 'Verified', 'Rejected') DEFAULT 'Pending Verification',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            // Check if column exists, if not add it
            $res = $pdo->query("SHOW COLUMNS FROM orders LIKE 'payment_period'");
            if ($res->rowCount() == 0) {
                $pdo->exec("ALTER TABLE orders ADD COLUMN payment_period INT DEFAULT 0");
            }
        } catch (Exception $e) {
        }

        if (isset($input['login'])) {
            $email = $input['email'];
            $password = $input['password'];

            if ($contr->login('users', 'email', $email, 'password', $password)) {
                $user = $view->showRecords("users", ['email' => $email]);
                echo json_encode(['success' => 'Login successful', 'user' => $user[0]]);
            } else {
                echo json_encode(['error' => 'Invalid email or password']);
            }

        } elseif (isset($input['register'])) {
            $data = [
                "username" => $input['username'],
                "email" => $input['email'],
                "password" => $input['password'],
                "phone" => $input['phone'] ?? '',
                "country" => $input['country'] ?? '',
                "role" => "user",
                "created_at" => date('Y-m-d H:i:s')
            ];

            // Simple check if user exists
            $exists = $view->showRecords("users", ['email' => $data['email']]);
            if (!empty($exists)) {
                echo json_encode(['error' => 'Email already registered']);
            } else {
                if ($contr->addRecord("users", $data)) {
                    $user = $view->showRecords("users", ['email' => $data['email']]);
                    echo json_encode(['success' => 'Account created successfully', 'user' => $user[0]]);
                } else {
                    echo json_encode(['error' => 'Failed to create account']);
                }
            }

        } elseif (isset($input['resetPassword'])) {
            $email = $input['email'];
            $newPassword = $input['password'];

            if ($contr->modifyRecord("users", ["password" => $newPassword], ["email" => $email])) {
                echo json_encode(['success' => 'Password reset successful']);
            } else {
                echo json_encode(['error' => 'User not found or reset failed']);
            }

        } elseif (isset($input['updateProfile'])) {
            $email = $input['email'];
            $data = ["username" => $input['username']];

            if ($contr->modifyRecord("users", $data, ["email" => $email])) {
                $user = $view->showRecords("users", ['email' => $email]);
                echo json_encode(['success' => 'Profile updated', 'user' => $user[0]]);
            } else {
                echo json_encode(['error' => 'Update failed']);
            }

        } elseif (isset($input['placeOrder'])) {
            $data = [
                "vehicle_id" => $input['vehicle_id'],
                "buyer_email" => $input['buyer_email'],
                "payment_type" => $input['payment_type'],
                "deposit_amount" => $input['deposit_amount'],
                "monthly_installment" => $input['monthly_installment'] ?? 0,
                "payment_period" => $input['payment_period'] ?? 0,
                "status" => "Pending Verification",
                "country" => $input['country'] ?? 'United States',
                "state" => $input['state'],
                "city" => $input['city'] ?? '',
                "address" => $input['address'],
                "zip_code" => $input['zip_code'],
                "created_at" => date('Y-m-d H:i:s')
            ];

            if (isset($_FILES['receipt'])) {
                $uploadPath = $contr->uploadFile('receipt', 'uploads/receipts/');
                if ($uploadPath)
                    $data['receipt_path'] = $uploadPath;
            }

            if ($contr->addRecord("orders", $data)) {
                $contr->modifyRecord("vehicles", ["status" => "reserved"], ["id" => $input['vehicle_id']]);
                echo json_encode(['success' => 'Order placed successfully.']);
            } else {
                echo json_encode(['error' => 'Failed to place order']);
            }

        } elseif (isset($input['addVehicle'])) {
            $data = [
                "make" => $input['make'],
                "model" => $input['model'],
                "year" => $input['year'],
                "price" => $input['price'],
                "vin" => $input['vin'],
                "mileage" => $input['mileage'],
                "engine" => $input['engine'] ?? '',
                "transmission" => $input['transmission'] ?? '',
                "color" => $input['color'] ?? '',
                "status" => "available"
            ];

            $data['image'] = $input['image'] ?? '';

            $vehicleId = $contr->addRecord("vehicles", $data);
            if ($vehicleId) {
                if (isset($_FILES['images'])) {
                    $files = $_FILES['images'];
                    for ($i = 0; $i < count($files['name']); $i++) {
                        if ($files['error'][$i] === UPLOAD_ERR_OK) {
                            $filename = uniqid() . "_" . basename($files['name'][$i]);
                            $targetPath = "uploads/vehicles/" . $filename;
                            if (move_uploaded_file($files['tmp_name'][$i], $targetPath)) {
                                $contr->addRecord("vehicle_images", [
                                    "vehicle_id" => $vehicleId,
                                    "image_path" => $targetPath
                                ]);
                            }
                        }
                    }
                }
                echo json_encode(['success' => 'Vehicle added successfully']);
            } else {
                echo json_encode(['error' => 'Failed to add vehicle']);
            }

        } elseif (isset($input['updateVehicle'])) {
            $id = $input['id'];
            unset($input['updateVehicle'], $input['id']);
            if ($contr->modifyRecord("vehicles", $input, ["id" => $id])) {
                echo json_encode(['success' => 'Vehicle updated successfully']);
            } else {
                echo json_encode(['error' => 'Failed to update vehicle or no changes made']);
            }

        } elseif (isset($input['deleteVehicle'])) {
            if ($contr->removeRecord("vehicles", ["id" => $input['id']])) {
                echo json_encode(['success' => 'Vehicle deleted successfully']);
            }

        } elseif (isset($input['toggleWishlist'])) {
            $email = $input['email'];
            $vehicleId = $input['vehicle_id'];

            $existing = $view->showRecords("wishlist", ["user_email" => $email, "vehicle_id" => $vehicleId]);
            if (!empty($existing)) {
                if ($contr->removeRecord("wishlist", ["id" => $existing[0]['id']])) {
                    echo json_encode(['success' => 'Removed from wishlist']);
                }
            } else {
                if ($contr->addRecord("wishlist", ["user_email" => $email, "vehicle_id" => $vehicleId])) {
                    echo json_encode(['success' => 'Added to wishlist']);
                }
            }

        } elseif (isset($input['verifyPayment'])) {
            $status = $input['status'];
            if (isset($input['payment_id'])) {
                if ($contr->modifyRecord("payments", ["status" => $status], ["id" => $input['payment_id']])) {
                    echo json_encode(['success' => 'Installment verified']);
                }
            } else {
                $orderId = $input['order_id'];
                if ($contr->modifyRecord("orders", ["status" => $status], ["id" => $orderId])) {
                    if ($status === 'Delivered') {
                        $order = $view->showRecords("orders", ["id" => $orderId])[0];
                        $contr->modifyRecord("vehicles", ["status" => "sold"], ["id" => $order['vehicle_id']]);
                    }
                    echo json_encode(['success' => 'Order status updated']);
                }
            }
        } elseif (isset($input['addPayment'])) {
            $data = [
                "order_id" => $input['order_id'],
                "amount" => $input['amount'] ?? 0,
                "month_number" => $input['month_number'] ?? 0,
                "status" => "Pending Verification",
                "created_at" => date('Y-m-d H:i:s')
            ];

            if (isset($_FILES['receipt'])) {
                $uploadPath = $contr->uploadFile('receipt', 'uploads/receipts/');
                if ($uploadPath)
                    $data['receipt_path'] = $uploadPath;
            }

            if ($contr->addRecord("payments", $data)) {
                echo json_encode(['success' => 'Payment receipt uploaded.']);
            } else {
                echo json_encode(['error' => 'Failed to upload payment.']);
            }

        } else {
            echo json_encode(['error' => 'Missing controller action']);
        }
    } else {
        echo json_encode(['error' => 'Invalid request method']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>