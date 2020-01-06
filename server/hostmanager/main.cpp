#include <QCommandLineParser>
#include <QCoreApplication>

#include "gamehostshub.h"

// TODO Remove parsing arguments from main to shorten it
int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);

    QCommandLineParser parser;
    parser.setApplicationDescription("Game host for bomberman servers");
    parser.addPositionalArgument("OverseerPort", "Port for communicating with overseer");
    parser.addPositionalArgument("MaxGames", "Maximum number of games application is allowed to start");

    parser.process(a);

    const QStringList args = parser.positionalArguments();

    if (args.size() < 3) {
        qCritical() << "Not all positional arguments were provided";
        return 1;
    }

    bool parsingResult;

    auto overseerPort = static_cast<quint16>(args.at(0).toShort(&parsingResult));
    if (!parsingResult) {
        qCritical() << "Port is not a number!";
        return 2;
    }

    auto maxGames = static_cast<quint32>(args.at(1).toInt(&parsingResult));
    if (!parsingResult) {
        qCritical() << "MaxGames is not a number!";
        return 3;
    }

    QString gameHostPath = args.at(2);
    if (gameHostPath.isEmpty()) {
        qCritical() << "Game host path is not provided";
        return 4;
    }

    // Initialize singleton at the start
    OverseerCommunication *overseerCommunication = new OverseerCommunication(overseerPort, &a);
    GameHostsHub gameHostsHub(overseerCommunication, maxGames, &a);

    if (overseerCommunication->isCommunicationWorking()) {
        qCritical() << "Communication could not start";
        return 5;
    }

    return a.exec();
}
