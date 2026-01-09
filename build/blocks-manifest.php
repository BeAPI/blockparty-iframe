<?php
// This file is generated. Do not modify it manually.
return array(
	'blockparty-iframe' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'blockparty/iframe',
		'version' => '1.0.2',
		'title' => 'Iframe',
		'category' => 'widgets',
		'description' => 'Display an embedded frame.',
		'example' => array(
			
		),
		'supports' => array(
			'align' => array(
				'wide',
				'full'
			),
			'dimensions' => array(
				'aspectRatio' => true,
				'height' => true,
				'width' => true
			),
			'html' => false
		),
		'attributes' => array(
			'lazyload' => array(
				'type' => 'boolean',
				'default' => false
			),
			'title' => array(
				'type' => 'string',
				'default' => ''
			),
			'url' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'textdomain' => 'blockparty-iframe',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css'
	)
);
