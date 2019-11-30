""" HostManager is responsible for communicating with host manager c++ application

Docs will go there

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

        subprocess.Popen([settings.HOST_MANAGER_PATH, str(port), str(max_games)])
        self.conn, self.addr = self.s.accept()

        self.thread = threading.Thread(target=self.run)
        self.thread.start()

    def create_room(self):
        pass

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
