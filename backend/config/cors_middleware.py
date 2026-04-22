class SimpleCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # On laisse passer les requêtes "OPTIONS" (Preflight)
        if request.method == "OPTIONS":
            from django.http import HttpResponse
            response = HttpResponse()
        else:
            response = self.get_response(request)

        # On ajoute les headers manuellement
        response["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response
