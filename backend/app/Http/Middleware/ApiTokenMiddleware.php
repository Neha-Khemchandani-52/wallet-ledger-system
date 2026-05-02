<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $token = $request->header('X-API-KEY');

        if (!$token || $token !== config('app.api_token')) {
            return response()->json([
                'error' => 'Unauthorized Access'
            ], 401);
        }

        return $next($request);
    }
}
