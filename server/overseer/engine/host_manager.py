""" HostManager is responsible for communicating with host manager c++ application

HostManager class on initialization starts an host manager application with arguments given in constructor.
It then estabilishes tcp communication between overseer and host manager.

"""
import asyncio
import json
import subprocess
import threading

import settings

TCP_IP = 'localhost'


class HostManager:

    def __init__(self, port, max_games):
        self.client_writer = None
        self.client_reader = None

        # # Start a host manager application
        # try:
        #     subprocess.Popen([settings.HOST_MANAGER_PATH, str(port), str(max_games)])
        # except FileNotFoundError:
        #     # TODO logg information about file not found
        #     print("Wrong path to hostmanager")
        #     print("Given path: ", settings.HOST_MANAGER_PATH)
        #     exit(1)

        self.thread = None
        self.awaiting_rooms = {}  # TODO Maybe remove after some time rooms from there?
        # Callback that should accept username and jwt and return true/false depending on if user is authorized
        self.authorization_callback = None
        # Callback that should accept Room object and port so given room can be informed where it can connect
        self.room_ready_callback = None

    def send_create_room_request(self, room):
        serialized_room = room.serialize(only_usernames=True)
        expected_players = serialized_room['users']
        self.awaiting_rooms[expected_players.sort()] = room

        request = {
            'messageType': 'roomRequest',
            'content': {
                'expectedPlayers': expected_players
            }
        }
        request = json.dumps(request)
        request += '\n'
        print('we are sending {}\n'.format(request))
        self.client_writer.write(request.encode())

    def handle_authorization(self, credentials):
        if 'jwtToken' not in credentials and 'username' not in credentials:
            print('lack of credentials')
            return

        authorized = self.authorization_callback(credentials['jwtToken'], credentials['username'])
        response = {
            'messageType': 'authorization',
            'content': {
                'jwtToken': credentials['jwtToken'],
                'username': credentials['username']
            }
        }
        response['content']['authorized'] = authorized

        response = json.dumps(response)
        response += '\n'
        print('send {}'.format(response))
        self.client_writer.write(response.encode())

    def handle_room_ready_response(self, message):
        if 'expectedPlayers' not in message and 'port' not in message:
            print('missing fields in message')
            return

        expected_players = message['expectedPlayers'].sort()
        room = self.awaiting_rooms.pop(expected_players)

        if room is None:
            return

        self.room_ready_callback(room, message['port'])

    def stop_work(self):
        self.client_writer.close()
        if self.thread is not None:
            self.thread.join()


host_manager = HostManager(settings.HOST_MANAGER_PORT, settings.MAX_GAMES_PER_HOST)


def accept_client(client_reader, client_writer):
    global host_manager
    task = asyncio.Task(handle_message(client_reader, client_writer))
    host_manager.client_writer = client_writer
    host_manager.client_reader = client_reader

    def done_client(task):
        host_manager.client = None
        client_writer.close()

    print("New connection")
    task.add_done_callback(done_client)


@asyncio.coroutine
def handle_message(client_reader, client_writer):
    while True:
        data = yield from asyncio.wait_for(client_reader.readline(), timeout=None)
        print("received data {}".format(data.decode('utf-8')))
        msg = json.loads(data.decode('utf-8'))

        if 'messageType' not in msg and 'content' not in msg:
            print('Message has no proper structure')
            continue

        if msg['messageType'] == 'authorization':
            host_manager.handle_authorization(msg['content'])

        if msg['messageType'] == 'roomReady':
            host_manager.handle_room_ready_response(msg['content'])


loop = asyncio.get_event_loop()
stream = asyncio.start_server(accept_client, host=TCP_IP, port=settings.HOST_MANAGER_PORT)
loop.run_until_complete(stream)

host_manager.thread = threading.Thread(target=loop.run_forever)
host_manager.thread.daemon = True
host_manager.thread.start()
