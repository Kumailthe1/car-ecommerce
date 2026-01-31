<?php 
	
	/**
	 	* View
	 */
	class View extends Model
	{

		/**
		 * Framework
		 * */
		
		public function countRecords($table, $conditions = []){
            return $this->setCountRecords($table, $conditions);
        }


        public function countRange($table, $conditions = []){
            return $this->setCountRecordsRange($table, $conditions = []);
        }
        
        
        public function showRecords($table, $conditions = [], $orderBy = null, $order = 'ASC', $limit = null){
            return $this->selectRecords($table, $conditions, $orderBy, $order, $limit);
        }
    
        public function getDistinct($table, $columns = [], $conditions = [], $orderBy = null, $order = 'ASC', $limit = null) {
            return $this->selectDistinctRecords($table, $columns, $conditions, $orderBy, $order, $limit);
        }
    
    
    

		
	}