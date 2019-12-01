#include "overseercommunication.h"

OverseerCommunication &OverseerCommunication::getInstance()
{
    // We are not expecting instance to have a QObject parent
    static OverseerCommunication instance;
    return instance;
}

bool OverseerCommunication::init(const quint16 overseerPort_, const quint32 maxRooms_)
{
    m_overseerPort = overseerPort_;
    m_maxRooms = maxRooms_;

   // m_socket.bind(QHostAddress::LocalHost, m_overseerPort);
    m_socket.connectToHost("localhost", overseerPort_, QTcpSocket::ReadWrite);

    // We can block process while waiting for connection because without it
    // application does not have much to do anyway
    m_socket.waitForConnected(5000);

    if (m_socket.state() != QTcpSocket::ConnectedState) {
        qCritical() << "Socket could not connect!";
        return false;
    }

    m_testTimer.start(1500);
    connect(&m_testTimer, &QTimer::timeout, this, &OverseerCommunication::onTestTimeout);
    connect(&m_socket, &QTcpSocket::readyRead, this, &OverseerCommunication::onReadyRead);

    return true;
}

OverseerCommunication::OverseerCommunication(QObject *parent)
    : QObject(parent)
{

}

void OverseerCommunication::onTestTimeout()
{
    QJsonObject obj;
    obj.insert("KeyA", "RandomValue");
    obj.insert("KeyB", "AnotherValue");
    m_socket.write(QJsonDocument(obj).toJson());
}

void OverseerCommunication::onReadyRead()
{
    // NOTE This for causes host manager to react only after 5 received messages
    // In communication test overseer send message everytime host manager sends a message,
    // therefore without this respond-every-5-message condition overseer and host manager
    // would loop each other
    if (m_count < 5) {
        ++m_count;
        return;
    }

    m_count = 0;
    QByteArray data = m_socket.readAll();
    QByteArray response = "I read " + data;
    m_socket.write(response);
}
