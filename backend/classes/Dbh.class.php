<?php

class Dbh
{

	private $host = 'localhost';
	private $user = 'tlyrplis_tesla';
	private $pwd = 'tlyrplis_tesla';
	private $dbName = 'tlyrplis_tesla';
	private $pdo = null;

	protected function connect()
	{
		if ($this->pdo === null) {
			$dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->dbName;
			$this->pdo = new PDO($dsn, $this->user, $this->pwd);
			$this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
			$this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
		return $this->pdo;
	}
}