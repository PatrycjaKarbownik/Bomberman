#ifndef GAMEHOSTINSTANCE_H
#define GAMEHOSTINSTANCE_H

#include <QObject>
#include <QProcess>
#include <QDebug>


class GameHostInstance : public QObject
{
    Q_OBJECT
public:
    explicit GameHostInstance(quint32 maxGames, quint32 port, QString gameHostPath, QObject *parent = nullptr);

signals:
    void gameHostReady();
    void gameHostProcessFailed(QProcess::ProcessError error);

public slots:

private:
    void handleReceivedMessage(const QJsonObject& message);

    QProcess *m_process {nullptr};
    const quint32 m_maxGames;
    const quint32 m_port;

private slots:
    void onProcessReadyRead();
    void onProcessStateChanged(QProcess::ProcessState newState);

};

#endif // GAMEHOSTINSTANCE_H
