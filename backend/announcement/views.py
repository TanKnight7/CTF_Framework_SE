from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from knox.auth import TokenAuthentication
from rest_framework.response import Response
from .serializers import AnnouncementSerializer
from .models import Announcement


@api_view(['GET'])
def get_announcements(request):
    try:
        announcements = Announcement.objects.all().order_by('-created_at')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_announcement(request):
    # if not request.user.is_staff:
    #     return Response({"error": "Only staff members can create announcements"}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = AnnouncementSerializer(data=request.data, context={'request':request})
    if serializer.is_valid():
        serializer.save()
        return Response({"success": "Successfully created announcement", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def edit_announcement(request, announcement_id):
    # if not request.user.is_staff:
    #     return Response({"error": "Only staff members can edit announcements"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        announcement = Announcement.objects.get(id=announcement_id)
    except Announcement.DoesNotExist:
        return Response({"error": "Announcement not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = AnnouncementSerializer(announcement, data=request.data, context={'request':request})
    if serializer.is_valid():
        serializer.save()
        return Response({"success": "Successfully updated announcement", "data": serializer.data}, status=status.HTTP_200_OK)
    return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_announcement(request, announcement_id):
    # if not request.user.is_staff:
    #     return Response({"error": "Only staff members can delete announcements"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        announcement = Announcement.objects.get(id=announcement_id)
    except Announcement.DoesNotExist:
        return Response({"error": "Announcement not found"}, status=status.HTTP_404_NOT_FOUND)
    
    announcement.delete()
    return Response({"success": "Successfully deleted announcement"}, status=status.HTTP_200_OK)

