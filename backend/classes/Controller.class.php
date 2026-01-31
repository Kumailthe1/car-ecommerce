<?php 

	/**
	 	* Controller
	 */
	 
	class Controller extends Model
	{
	    
	    //Login
	    public function login($table, $identifierColumn, $identifierValue, $passwordColumn, $passwordValue){
            // Fetch user record based on the identifier
            $user = $this->selectRecords($table, [$identifierColumn => $identifierValue, $passwordColumn => $passwordValue]);
    
            if ($user && isset($user[0][$passwordColumn])) { 
                // Verify the password
                return true;
            }
    
            return false; // User not found or password did not match
        }
        
        public function uploadFile($fileInputName, $targetDir) {
            if (isset($_FILES[$fileInputName]) && $_FILES[$fileInputName]['error'] === UPLOAD_ERR_OK) {
                $filename = basename($_FILES[$fileInputName]['name']);
                $targetFile = $targetDir . uniqid() . "_" . $filename; // Avoid filename collisions
                if (move_uploaded_file($_FILES[$fileInputName]['tmp_name'], $targetFile)) {
                    return $targetFile;
                }
            }
            return false;
        }

		
		// Insert new record
        public function addRecord($table, $data){
            return $this->insertRecord($table, $data);
        }
    
        // Update existing record
        public function modifyRecord($table, $data, $conditions){
            return $this->updateRecord($table, $data, $conditions);
        }
    
        // Delete record(s)
        public function removeRecord($table, $conditions){
            return $this->deleteRecord($table, $conditions);
        }
        
		
	}