#include "gamehostinstance.h"

#include <QJsonDocument>
#include <QJsonObject>

GameHostInstance::GameHostInstance(quint32 maxGames, quint32 port, QString gameHostPath, QObject *parent)
    : QObject(parent),
      m_maxGames(maxGames),
      m_port(port)
{
    m_process = new QProcess(this);
    QStringList args;
    args.append(QString::number(port));
    m_process->setProgram(gameHostPath);
    m_process->setArguments(args);

    connect(m_process, &QProcess::readyReadStandardOutput, this, &GameHostInstance::onProcessReadyRead);
    connect(m_process, &QProcess::stateChanged, this, &GameHostInstance::onProcessStateChanged);
    m_process->start();
}

void GameHostInstance::handleReceivedMessage(const QJsonObject &message)
{
    QJsonValue typeValue = message.value("type");
    if (typeValue == QJsonValue::Undefined) {
        qWarning() << "GameHostInstance received message without type field";
        return;
    }

    QString type = typeValue.toString();

    if (type.compare("authorization")) {

    }

}

void GameHostInstance::onProcessReadyRead()
{
    while(m_process->canReadLine()) {
        QByteArray binaryMessage = m_process->readLine();
        QJsonDocument jsonDocument = QJsonDocument::fromJson(binaryMessage);
        if (jsonDocument.isEmpty()) {
            qWarning() << "Gamehost received message and it's unable to validate it";
            qWarning() << "Message: " << 2;
        }
        QJsonObject message = jsonDocument.object();
        handleReceivedMessage(message);
    }
}

void GameHostInstance::onProcessStateChanged(QProcess::ProcessState newState)
{
    if (newState == QProcess::NotRunning) {
        qWarning() << QString("Game host instance crashed (port %1)").arg(m_port);
        emit gameHostProcessFailed(m_process->error());
    }
}
