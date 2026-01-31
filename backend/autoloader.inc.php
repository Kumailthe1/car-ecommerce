<?php 
  spl_autoload_register('myAutoloader');

  function myAutoloader($className){

    $url = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
    if(strpos($url, 'adminCall') == true){

      $path = '../classes/';

    }else{
      $path = 'classes/';

    }

    $extention = '.class.php';

    require_once $fullPath = $path.$className.$extention;
  }
?>