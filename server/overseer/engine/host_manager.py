""" HostManager is responsible for communicating with host manager c++ application

HostManager class on initialization starts an host manager application with arguments given in constructor.
It then estabilishes tcp communication between overseer and host manager.

"""

import socket
import subprocess
import threading

import settings

TCP_IP = 'localhost'


class HostManager:

    def __init__(self, port, max_games):
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.s.bind((TCP_IP, port))
        self.s.listen(1)

        # Start a host manager application
        try:
            subprocess.Popen([settings.HOST_MANAGER_PATH, str(port), str(max_games), settings.GAME_HOST_PATH])
        except FileNotFoundError:
            # TODO logg information about file not found
            print("Wrong path to hostmanager")
            print("Given path: ", settings.HOST_MANAGER_PATH)
            exit(1)

        self.conn, self.addr = self.s.accept()

        self.thread = threading.Thread(target=self.run)
        self.thread.start()

    def create_room(self):
        create_room_message = {
            "type": "CREATE_ROOM",
        }
        self.conn.send(bytes(str(create_room_message)))

    def _create_host(self):
        pass

    def stop_work(self):
        self.thread.join()

    def run(self):
        print('Someone connected, ip: ' + str(self.addr))
        while True:
            data = self.conn.recv(1024)
            if not data:
                break
            print("Received data: " + str(data))
            self.conn.send(bytes("asdfghj", 'utf-8'))
        self.conn.close()
        print("echo")


host_manager = HostManager(settings.HOST_MANAGER_PORT, settings.MAX_GAMES_PER_HOST)
