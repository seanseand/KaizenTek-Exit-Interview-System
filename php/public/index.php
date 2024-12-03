<?php
// Function to handle routing
function routeRequest($routes)
{
	// Parse the request URI (remove query strings for clean routes)
	$request = strtok($_SERVER['REQUEST_URI'], '?');

	// Route the request
	if (array_key_exists($request, $routes)) {
		$file = $routes[$request];
		$filePath = realpath(__DIR__ . '/' . $file);
		if ($filePath && file_exists($filePath)) {
			require $filePath;
		} else {
			http_response_code(404);
			echo "404 Not Found: The file for this route does not exist. Path: " . $filePath;
		}
	} else {
		http_response_code(404);
		echo "404 Not Found: Invalid route.";
	}
}

// Define your routes
$routes = [
    '/' => 'assets/static/login.html',
    '/student-home' => 'assets/static/student_home.html',
    '/api/login' => '../src/controllers/login.php',
    '/api/logout' => '../src/controllers/logout.php',
    '/api/view-answered-evaluations' => '../src/models/view_answered_evaluations.php',
    '/api/view-published-evaluations' => '../src/models/view_published_evaluations.php',
    '/api/get-answers' => '../src/models/get_answers.php',
    '/api/get-evaluation-questions' => '../src/models/get_evaluation_questions.php',
    '/api/submit-answers' => '../src/models/submit_answers.php',
    '/api/get_username' => '../src/utils/get_username.php',
];

// Call the routing function
routeRequest($routes);