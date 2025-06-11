from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from .models import Submission
from .serializers import SubmissionSerlializers

@api_view(['GET'])
def submissions(request):
    submissions = Submission.objects.all()
    serializer = SubmissionSerlializers(submissions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)