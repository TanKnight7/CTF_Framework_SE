from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from .models import Submission
from .serializers import SubmissionSerlializers

### ==== Authentication & Authorization
from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def submissions(request):
    submissions = Submission.objects.all()
    serializer = SubmissionSerlializers(submissions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)