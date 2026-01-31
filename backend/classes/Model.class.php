<?php

/**
 * Model
 */
class Model extends Dbh
{


    protected function selectRecords($table, $conditions = [], $orderBy = null, $order = 'ASC', $limit = null)
    {
        // Start with base SQL query
        $sql = "SELECT * FROM $table";

        // Add WHERE clause if conditions are provided
        if (!empty($conditions)) {
            $whereClauses = [];
            foreach ($conditions as $column => $value) {
                $whereClauses[] = "$column = ?";
            }
            $sql .= " WHERE " . implode(" AND ", $whereClauses);
        }

        // Add ORDER BY clause if specified
        if ($orderBy) {
            $sql .= " ORDER BY $orderBy $order";
        }
        if ($limit) {
            $sql .= " LIMIT $limit";
        }

        // Prepare the statement
        $stmt = $this->connect()->prepare($sql);

        // Execute with condition values if provided
        $stmt->execute(array_values($conditions));

        // Fetch all results
        $result = $stmt->fetchAll();

        // Return the result if records are found, otherwise return false
        return $stmt->rowCount() > 0 ? $result : false;
    }

    protected function selectDistinctRecords($table, $columns = [], $conditions = [], $orderBy = null, $order = 'ASC', $limit = null)
    {
        // Ensure columns for DISTINCT selection
        $distinctColumns = !empty($columns) ? implode(", ", $columns) : '*';
        $sql = "SELECT DISTINCT $distinctColumns FROM $table";

        // Add WHERE clause if conditions are provided
        if (!empty($conditions)) {
            $whereClauses = [];
            $values = [];
            foreach ($conditions as $column => $value) {
                $whereClauses[] = "$column = ?";
                $values[] = $value;
            }
            $sql .= " WHERE " . implode(" AND ", $whereClauses);
        }

        // Add ORDER BY clause if specified
        if ($orderBy) {
            $sql .= " ORDER BY $orderBy $order";
        }
        if ($limit) {
            $sql .= " LIMIT $limit";
        }

        // Prepare the statement
        $stmt = $this->connect()->prepare($sql);

        // Execute with condition values if provided
        $stmt->execute($values);

        // Fetch all unique results
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }


    protected function setCountRecords($table, $conditions = [])
    {
        // Start with base SQL query
        $sql = "SELECT * FROM $table";

        // Add WHERE clause if conditions are provided
        if (!empty($conditions)) {
            $whereClauses = [];
            foreach ($conditions as $column => $value) {
                $whereClauses[] = "$column = ?";
            }
            $sql .= " WHERE " . implode(" AND ", $whereClauses);
        }

        // Prepare the statement
        $stmt = $this->connect()->prepare($sql);

        // Execute with condition values if provided
        $stmt->execute(array_values($conditions));

        // count all results
        $result = $stmt->rowCount();
        return $result;
    }


    protected function setCountRecordsRange($table, $conditions = [])
    {
        // Start with base SQL query
        $sql = "SELECT * FROM $table";

        // Add WHERE clause if conditions are provided
        if (!empty($conditions)) {
            $whereClauses = [];
            $values = [];
            foreach ($conditions as $column => $value) {
                if (is_array($value) && count($value) === 2) {
                    // Handle range (BETWEEN) condition
                    $whereClauses[] = "$column BETWEEN ? AND ?";
                    $values[] = $value[0];
                    $values[] = $value[1];
                } else {
                    $whereClauses[] = "$column = ?";
                    $values[] = $value;
                }
            }
            $sql .= " WHERE " . implode(" AND ", $whereClauses);
        }

        // Prepare the statement
        $stmt = $this->connect()->prepare($sql);

        // Execute with condition values if provided
        $stmt->execute($values);

        // Count all results
        $result = $stmt->rowCount();
        return $result;
    }

    protected function insertRecord($table, $data)
    {
        // Prepare column names and placeholders
        $columns = implode(", ", array_keys($data));
        $placeholders = implode(", ", array_fill(0, count($data), "?"));

        // Construct SQL query
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";

        // Prepare and execute the statement
        $conn = $this->connect();
        $stmt = $conn->prepare($sql);
        if ($stmt->execute(array_values($data))) {
            return $conn->lastInsertId();
        }
        return false;
    }

    protected function updateRecord($table, $data, $conditions)
    {
        // Prepare SET clause
        $setClause = implode(", ", array_map(function ($column) {
            return "$column = ?";
        }, array_keys($data)));

        // Prepare WHERE clause
        $whereClause = implode(" AND ", array_map(function ($column) {
            return "$column = ?";
        }, array_keys($conditions)));

        // Construct SQL query
        $sql = "UPDATE $table SET $setClause WHERE $whereClause";

        // Prepare and execute the statement
        $stmt = $this->connect()->prepare($sql);
        return $stmt->execute(array_merge(array_values($data), array_values($conditions)));
    }

    protected function deleteRecord($table, $conditions)
    {
        // Prepare WHERE clause
        $whereClause = implode(" AND ", array_map(function ($column) {
            return "$column = ?";
        }, array_keys($conditions)));

        // Construct SQL query
        $sql = "DELETE FROM $table WHERE $whereClause";

        // Prepare and execute the statement
        $stmt = $this->connect()->prepare($sql);
        return $stmt->execute(array_values($conditions));
    }


}


