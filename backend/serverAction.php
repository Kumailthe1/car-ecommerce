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
        $input = json_decode(file_get_contents('php://input'), true);
        date_default_timezone_set("America/New_York");

        if (isset($input['page'])) {
            if ($input['page'] == 'vehicles') {
                $results = $view->showRecords("vehicles", [], "id", "DESC");
                echo json_encode($results ?: []);

            } elseif ($input['page'] == 'vehicle') {
                $id = $input['id'];
                $vehicle = $view->showRecords("vehicles", ['id' => $id]);
                if (!empty($vehicle)) {
                    $vehicleData = $vehicle[0];
                    $gallery = $view->showRecords("vehicle_images", ['vehicle_id' => $id]);
                    $vehicleData['gallery'] = array_column($gallery, 'image_path');
                    echo json_encode($vehicleData);
                } else {
                    echo json_encode(['error' => 'Vehicle not found']);
                }

            } elseif ($input['page'] == 'orders') {
                $conditions = [];
                if (isset($input['email']) && isset($input['role']) && strtolower($input['role']) === 'user') {
                    $conditions = ['buyer_email' => $input['email']];
                }

                $orders = $view->showRecords("orders", $conditions, "id", "DESC");
                $responseData = [];

                if (!empty($orders)) {
                    foreach ($orders as $order) {
                        $vResults = $view->showRecords("vehicles", ['id' => $order['vehicle_id']]);
                        if (!empty($vResults))
                            $order['vehicle'] = $vResults[0];
                        $responseData[] = $order;
                    }
                }
                echo json_encode($responseData);

            } elseif ($input['page'] == 'transactions') {
                $orders = $view->showRecords("orders", [], "id", "DESC");
                $installments = $view->showRecords("payments", [], "id", "DESC");

                $transactions = [];

                if (!empty($orders)) {
                    foreach ($orders as $order) {
                        $vResults = $view->showRecords("vehicles", ['id' => $order['vehicle_id']]);
                        $order['type'] = 'Initial Deposit';
                        $order['amount_display'] = $order['deposit_amount'];
                        $order['reference'] = "#EB-" . str_pad($order['id'], 4, '0', STR_PAD_LEFT);
                        if (!empty($vResults))
                            $order['vehicle'] = $vResults[0];
                        $transactions[] = $order;
                    }
                }

                if (!empty($installments)) {
                    foreach ($installments as $inst) {
                        $orderResults = $view->showRecords("orders", ['id' => $inst['order_id']]);
                        if (!empty($orderResults)) {
                            $order = $orderResults[0];
                            $vResults = $view->showRecords("vehicles", ['id' => $order['vehicle_id']]);
                            $inst['type'] = "Month " . ($inst['month_number'] ?: "?") . " Installment";
                            $inst['amount_display'] = $inst['amount'];
                            $inst['buyer_email'] = $order['buyer_email'];
                            $inst['reference'] = "#PL-" . str_pad($inst['id'], 4, '0', STR_PAD_LEFT) . " (Ord #" . $order['id'] . ")";
                            if (!empty($vResults))
                                $inst['vehicle'] = $vResults[0];
                            $transactions[] = $inst;
                        }
                    }
                }

                // Sort by date DESC
                usort($transactions, function ($a, $b) {
                    return strtotime($b['created_at']) - strtotime($a['created_at']);
                });

                echo json_encode($transactions);

            } elseif ($input['page'] == 'order') {
                $id = $input['id'];
                $order = $view->showRecords("orders", ['id' => $id]);
                if (!empty($order)) {
                    $orderData = $order[0];
                    $vResults = $view->showRecords("vehicles", ['id' => $orderData['vehicle_id']]);
                    if (!empty($vResults))
                        $orderData['vehicle'] = $vResults[0];

                    // Also fetch any multiple payments if they exist
                    try {
                        $payments = $view->showRecords("payments", ['order_id' => $id]);
                        $orderData['payments'] = $payments ?: [];
                    } catch (Exception $e) {
                        $orderData['payments'] = [];
                    }

                    echo json_encode($orderData);
                } else {
                    echo json_encode(['error' => 'Order not found']);
                }

            } elseif ($input['page'] == 'dashboard') {
                $v = $view->showRecords("vehicles");
                $totalVehicles = !empty($v) ? count($v) : 0;
                $av = $view->showRecords("vehicles", ['status' => 'available']);
                $availableVehicles = !empty($av) ? count($av) : 0;
                $o = $view->showRecords("orders");
                $totalOrders = !empty($o) ? count($o) : 0;

                $completedOrders = $view->showRecords("orders", ['status' => 'Delivered']);
                $totalRevenue = 0;
                if (!empty($completedOrders)) {
                    foreach ($completedOrders as $ord) {
                        $veh = $view->showRecords("vehicles", ['id' => $ord['vehicle_id']]);
                        if (!empty($veh))
                            $totalRevenue += (float) $veh[0]['price'];
                    }
                }

                echo json_encode([
                    'total_vehicles' => $totalVehicles,
                    'available_vehicles' => $availableVehicles,
                    'total_orders' => $totalOrders,
                    'total_revenue' => $totalRevenue,
                    'recent_vehicles' => $view->showRecords("vehicles", [], "id", "DESC", 4)
                ]);

            } elseif ($input['page'] == 'profile') {
                if (isset($input['all']) && $input['all'] === true) {
                    $users = $view->showRecords("users", [], "id", "DESC");
                    echo json_encode($users ?: []);
                } else {
                    $email = $input['email'];
                    $profile = $view->showRecords("users", ['email' => $email]);
                    echo json_encode(!empty($profile) ? $profile[0] : ['error' => 'User not found']);
                }
            } elseif ($input['page'] == 'wishlist') {
                $email = $input['email'];
                $wishlist = $view->showRecords("wishlist", ['user_email' => $email]);
                $results = [];
                if (!empty($wishlist)) {
                    foreach ($wishlist as $item) {
                        $vehicle = $view->showRecords("vehicles", ['id' => $item['vehicle_id']]);
                        if (!empty($vehicle)) {
                            $item['vehicle'] = $vehicle[0];
                            $results[] = $item;
                        }
                    }
                }
                echo json_encode($results);
            } else {
                echo json_encode(['error' => 'Invalid page request: ' . ($input['page'] ?? 'null')]);
            }
        } else {
            echo json_encode(['error' => 'Missing page parameter']);
        }
    } else {
        echo json_encode(['error' => 'Invalid request method']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>