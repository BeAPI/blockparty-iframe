<?php
// This file is generated. Do not modify it manually.
return array(
	'blockparty-iframe' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'blockparty/iframe',
		'version' => '1.1.1',
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
			),
			'iframeAttributes' => array(
				'type' => 'array',
				'default' => array(
					
				),
				'items' => array(
					'type' => 'object',
					'properties' => array(
						'key' => array(
							'type' => 'string'
						),
						'value' => array(
							'type' => 'string'
						)
					)
				)
			)
		),
		'textdomain' => 'blockparty-iframe',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css'
	)
);
